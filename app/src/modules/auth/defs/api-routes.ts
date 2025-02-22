const prefix = '/auth';
const ApiRoutes = {
  Login: prefix + '/login',
  Register: prefix + '/register',
  Logout: prefix + '/logout',
  RequestPasswordReset: prefix + '/request-password-reset',
  ResetPassword: prefix + '/reset-password',
  Me: prefix + '/me',
  VerifyEmail: prefix + '/email/verify',
  ResendVerification: prefix + '/email/resend'
};

export default ApiRoutes;