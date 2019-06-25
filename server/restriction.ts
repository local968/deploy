const MB = 1024 * 1024;
const GB = MB * 1024;

export default {
  userProjectRestriction: [0, 15, 15, 150, Infinity],
  userConcurrentRestriction: [0, 1, 1, 5, Infinity],
  userDeployRestriction: [0, 20000, 20000, 200000, Infinity],
  userModelingRestriction: [0, 50 * MB, 50 * MB, 200 * MB, Infinity],
  userStorageRestriction: [0, 10 * GB, 10 * GB, 100 * GB, Infinity],

  updateRestriction: function(type, value) {
    type = type.substring(0, 1).toUpperCase() + type.substring(1);
    if (!this[`user${type}Restriction`]) throw new Error('wrong type');
    this[`user${type}Restriction`] = value;
  },
};
