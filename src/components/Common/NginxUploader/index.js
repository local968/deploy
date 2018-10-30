import moment from 'moment';
import axios from 'axios';
import _config from 'config'
window.axios = axios
export default (file, config = {}) => {
  config = {
    headers: { backend: _config.uploadBackend },
    path: `http://${(config.host || _config.uploadServer)}:${_config.nginxPort}/upload`,
    ...config
  }
  const uploader = new Uploader(file, config)
  uploader.onError(config.onError)
  uploader.onFinished(config.onFinished)
  uploader.onProgress(config.onProgress)
  uploader.upload()
  return { pause: uploader.pause.bind(uploader), resume: uploader.resume.bind(uploader) }
}

class Uploader {
  status = 'init';
  chunkCount = 0;
  errorTimes = 0;
  latestResponse = '';
  totalLoaded = 0;
  isPause = false;
  sessionId = moment().valueOf();
  speeds = [];

  constructor(file, config = {}) {
    this.path = config.path || '/upload';
    this.headers = config.headers || {};
    this.CHUNK_SIZE = parseInt(config.chunkSize, 10) || 4194304;
    this.concurrency = parseInt(config.concurrency, 10) || 4;
    this.file = file;
    if (config.params) {
      this.path += Object.entries(config.params).reduce(
        (prev, [key, value]) => {
          if (!key || !value) return prev;
          if (prev === '') return `?${key}=${value}`;
          return prev + `&${key}=${value}`;
        },
        ''
      );
    }
  }

  upload() {
    this.splitFile();
    this.uploadQueue();
  }

  splitFile() {
    this.status = 'splitting';
    const totalSize = this.file.size;
    this.chunkCount = parseInt(totalSize / this.CHUNK_SIZE, 10) + 1;
  }

  getNextChunk(increase = true, index) {
    index = index || this.nextIndex;
    const result = {
      data: this.file.slice(
        index * this.CHUNK_SIZE,
        (index + 1) * this.CHUNK_SIZE
      ),
      index
    };
    if (increase) this.nextIndex++;
    return result;
  }

  uploadQueue() {
    const concurrency = this.concurrency || 4;
    this.status = 'uploading';
    this.nextIndex = 0;
    this.processing = [];
    for (let i = 0; i < Math.min(concurrency, this.chunkCount); i++) {
      const chunk = this.getNextChunk();
      this.processing.push(
        this.uploadChunk(chunk.data, chunk.index, this.processing.length)
      );
    }
    this.startSpeedCalculate();
    this.race();
  }

  startSpeedCalculate() {
    const speedText = speed => {
      let unit = ' bytes/s';
      if (speed > 1024 * 1024 * 1024) {
        unit = ' Gb/s';
        return (speed / (1024 * 1024 * 1024)).toFixed(2) + unit;
      }
      if (speed > 1024 * 1024) {
        unit = ' Mb/s';
        return (speed / (1024 * 1024)).toFixed(2) + unit;
      }
      if (speed > 1024) {
        unit = ' kb/s';
        return (speed / 1024).toFixed(2) + unit;
      }

      return speed.toFixed(2) + unit;
    };
    this.startTime = moment().valueOf();
    let latestCalculateTime = this.startTime;
    let latestLoadedSize = this.totalLoaded;
    this.speedInterval = setInterval(() => {
      const currentTime = moment().valueOf();
      const currentLoadedSize = this.totalLoaded;
      this.speed =
        (currentLoadedSize - latestLoadedSize) /
        ((currentTime - latestCalculateTime) / 1000);
      this.speedText = speedText(this.speed);
      this.progress = this.totalLoaded + '/' + this.file.size;
      latestCalculateTime = currentTime;
      latestLoadedSize = currentLoadedSize;
      if (this.onProgressCallback && typeof this.onProgressCallback === 'function') {
        this.onProgressCallback(this.progress, this.speedText, this.speed)
      }
    }, 500);
  }

  stopSpeedCalculate() {
    clearInterval(this.speedInterval);
  }

  pause() {
    this.isPause = true;
  }

  resume() {
    if (this.status !== 'error' && this.status !== 'paused') return;
    this.status = 'uploading';
    this.isPause = false;
    Promise.all(this.processing).then(results => {
      results.forEach(({ res, error, index, processingIndex }) => {
        if (res && res.data) {
          this.latestResponse = res.data;
          if (this.nextIndex < this.chunkCount) {
            const chunk = this.getNextChunk();
            this.processing.splice(
              processingIndex,
              1,
              this.uploadChunk(chunk.data, chunk.index, processingIndex)
            );
          } else {
            this.processing.splice(processingIndex, 1);
            this.processing.forEach((promise, index) =>
              promise.then(result => {
                result.processingIndex = index;
                return result;
              })
            );
          }
        }
        if (error) {
          // replace error promise with new request
          const chunk = this.getNextChunk(false, index);
          this.processing.splice(
            processingIndex,
            1,
            this.uploadChunk(chunk.data, index, processingIndex)
          );
        }
      });
      this.startSpeedCalculate();
      this.race();
    });
  }

  race() {
    if (this.processing.length === 0) {
      this.stopSpeedCalculate();
      this.onFinishedCallback &&
        typeof this.onFinishedCallback === 'function' &&
        this.onFinishedCallback(this.latestResponse, this.file);
      return;
    }
    Promise.race(this.processing).then(
      ({ res, error, index, processingIndex }) => {
        if (this.isPause) {
          this.status = 'paused';
          this.stopSpeedCalculate();
        } else if (error) {
          // Pause for resume
          this.status = 'error';
          this.isPause = true;
          this.errorTimes++;
          this.onErrorCallback &&
            typeof this.onErrorCallback === 'function' &&
            this.onErrorCallback(error, this.errorTimes);
          this.stopSpeedCalculate();
        } else {
          this.latestResponse = res.data;
          if (this.nextIndex < this.chunkCount) {
            const chunk = this.getNextChunk();
            this.processing.splice(
              processingIndex,
              1,
              this.uploadChunk(chunk.data, chunk.index, processingIndex)
            );
          } else {
            this.processing.splice(processingIndex, 1);
            this.processing.map((promise, index) =>
              promise.then(result => {
                result.processingIndex = index;
                return result;
              })
            );
          }
          if (this.processing.length > 0) {
            this.race();
          } else {
            this.stopSpeedCalculate();
            this.onFinishedCallback &&
              typeof this.onFinishedCallback === 'function' &&
              this.onFinishedCallback(this.latestResponse, this.file);
          }
        }
      }
    );
  }

  onError(fn) {
    this.onErrorCallback = fn;
  }

  onFinished(fn) {
    this.onFinishedCallback = fn;
  }

  onProgress(fn) {
    this.onProgressCallback = fn
  }

  uploadChunk(chunk, index, processingIndex = 0) {
    const rangeEnd =
      (index + 1) * this.CHUNK_SIZE >= this.file.size
        ? this.file.size - 1
        : (index + 1) * this.CHUNK_SIZE - 1;
    let latestLoaded = 0;
    return axios
      .post(this.path, chunk, {
        headers: {
          'content-disposition': `attachment; filename="${encodeURIComponent(
            this.file.name
          )}"`,
          'content-type': 'application/octet-stream',
          'content-range': `bytes ${index * this.CHUNK_SIZE}-${rangeEnd}/${
            this.file.size
            }`,
          'session-id': this.sessionId,
          ...this.headers
        },
        onUploadProgress: event => {
          this.totalLoaded += event.loaded - latestLoaded;
          latestLoaded = event.loaded;
        }
      })
      .then(
        res => {
          this.totalLoaded += rangeEnd - index * this.CHUNK_SIZE - latestLoaded;
          return { res, index, processingIndex };
        },
        error => ({ error, index, processingIndex })
      );
  }
}
