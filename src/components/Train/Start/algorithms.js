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
      value: 'HBOS',
      label: 'HBOS (Histogram-based Outlier Score)'
    },
    {
      value: 'PCA',
      label: 'PCA (Principal Component Analysis)'
    },
    {
      value: 'IsolationForest',
      label: 'Isolation Forest'
    },
    {
      value: 'MCD',
      label: 'MCD（Minimum Covariance Determinant）'
    },
    {
      value: 'EllipticEnvelope',
      label: 'EllipticEnvelope'
    },
    {
      value: 'OneClassSVM',
      label: 'OneClassSVM'
    },
    
    {
      value: 'LocalOutlierFactor',
      label: 'Local Outlier Factor'
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
