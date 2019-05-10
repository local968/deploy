export default {
  Clustering: [
    {
      value: 'KMeans',
      label: 'KMeans'
    },
    {
      value: 'GMM',
      label: 'GaussianMixture'
    },
    {
      value: 'MeanShift',
      label: 'MeanShift'
    },
    {
      value: 'SpectralClustering',
      label: 'SpectralClustering'
    },
    {
      value: 'Agg',
      label: 'AgglomerativeClustering'
    },
    {
      value: 'DBSCAN',
      label: 'DBSCAN'
    },
    {
      value: 'Birch',
      label: 'Birch'
    },
  ],
  Outlier: [
    {
      value: 'IsolationForest',
      label: 'Isolation Forest'
    },
    {
      value: 'OneClassSVM',
      label: 'OneClassSVM'
    },
    {
      value: 'EllipticEnvelope',
      label: 'EllipticEnvelope'
    },
    {
      value: 'LocalOutlierFactor',
      label: 'Local Outlier Factor'
    },
    {
      value: 'PCA',
      label: 'PCA (Principal Component Analysis)'
    },
    {
      value: 'HBOS',
      label: 'HBOS (Histogram-based Outlier Score)'
    },
    {
      value: 'CBLOF',
      label: 'CBLOF (Clustering-Based Local Outlier Factor)'
    },
    {
      value: 'ABOD',
      label: 'ABOD (Angle-Based Outlier Detection)'
    },
    {
      value: 'FB',
      label: 'FB (Feature Bagging)'
    },
  ]
}
