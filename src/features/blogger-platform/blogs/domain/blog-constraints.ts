export const nameConstraints = {
  minLength: 1,
  maxLength: 15,
};
export const descriptionConstraints = {
  minLength: 1,
  maxLength: 500,
};
export const websiteUrlConstraints = {
  minLength: 1,
  maxLength: 100,
  match: /^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/,
};
