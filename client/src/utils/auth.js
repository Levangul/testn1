import decode from 'jwt-decode';

class AuthService {
  getProfile() {
    const token = this.getToken();
    if (!token || this.isTokenExpired(token)) {
      this.logout();
      return null;
    }
    return decode(token);
  }

  loggedIn() {
    const token = this.getToken();
    return token && !this.isTokenExpired(token);
  }

  isTokenExpired(token) {
    if (!token) return true;
    const decoded = decode(token);
    return decoded.exp < Date.now() / 1000;
  }

  getToken() {
    const token = localStorage.getItem('id_token');
    if (this.isTokenExpired(token)) {
      this.logout();
      return null;
    }
    return token;
  }

  login(idToken) {
    localStorage.setItem('id_token', idToken);
  }

  logout() {
    localStorage.removeItem('id_token');
  }
}

export default new AuthService();

