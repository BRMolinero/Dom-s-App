let _auth = {
  accessToken: null,
  setAccessToken: () => {},
};

export function bindAuth({ accessToken, setAccessToken }) {
  _auth = { accessToken, setAccessToken };
}

export function getAuth() {
  return _auth;
}
