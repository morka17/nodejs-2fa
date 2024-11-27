# FlareAuth - Node.js Authentication Library

FlareAuth is a powerful and flexible authentication library for Node.js applications. It provides comprehensive solutions for user signup, login, multi-factor authentication (2FA), and integration with third-party authentication providers. FlareAuth is designed to help developers implement secure and scalable authentication mechanisms easily.


## Features

- __User Signup:__ Register users using email/password or phone/password.

- __User Login:__ Authenticate users with email/password or phone/password.

- __Two-Factor Authentication (2FA):__ Secure new device sign-ins.

- __Provider Authentication:__ Integration with external providers like Google or Firebase.

- __Email Verification:__ Send and verify email-based confirmation links.

- __Password Reset:__ Send password reset links and update passwords securely.

- __Password Management:__ Change user passwords with robust checks.

- __Extensibility:__ Customizable for various use cases.


## Installation

Install the library via npm:
```sh   
npm install flare_auth
```


## Usage

### Initialization

Import and use FlareAuth in your Node.js application:

```bash
import FlareAuth from 'flareauth';

const auth = new FlareAuth();
```


## API Methods

### User Management

Create a New User
```bash  
auth.CreateNewUser({ user: { name: 'John Doe', email: 'john@example.com' } });
```

## Signup Methods

Signup with Email and Password

```bash  
auth.SignupWithEmailAndPassword({ email: 'john@example.com', password: 'securepassword123' });
```
Signup with Phone and Password

```bash  
auth.SignupWithPhoneNumberAndPassword({ phone: '+1234567890', password: 'securepassword123' });
```

## Login Methods

Login with Email and Password
```bash  
auth.SignInWithEmailAndPassword({ email: 'john@example.com', password: 'securepassword123' });
```
Login with Phone and Password
```bash  
auth.SignInWithPhoneNumberAndPassword({ phone: '+1234567890', password: 'securepassword123' });
```


## Two-Factor Authentication (2FA)

Start 2FA Authentication
```bash  
const options = { method: 'sms', phone: '+1234567890' }; // Example
auth.MultiAuthSignIn(options);
```
Verify 2FA Token

```bash  
auth.MultiAuthSignInVerification('token-from-sms-or-app');
```

## Provider Authentication

Sign in with External Provider
```bash  
auth.SignWithAuthProvider({ provider: 'google' });
```

## Email Verification

Send Email Verification Link
```bash  
auth.SendEmailVerificationLink('user-id');
```
Verify Email Link
```bash  
auth.VerifyEmailVerificationLink('token-from-email');
```

## Password Reset

Send Password Reset Link
```bash  
auth.SendPasswordResetLink('user-id');
```
Verify Password Reset Token
```bash  
auth.VerifyPasswordResetLink('reset-token');
```
Set New Password
```bash  
auth.setNewPassword({ resetToken: 'reset-token', setNewPassword: 'newPassword123' });
```
Change Password
```bash  
auth.changePassword({ uid: 'user-id', oldPassword: 'oldPassword123', newPassword: 'newPassword123' });
```


# TypeScript Support

FlareAuth is fully typed for TypeScript, providing robust type checking and IDE support.


# Exceptions

All methods return a Result object containing either the expected data or an `Exception`. Handle exceptions gracefully in your application:

```js 
const result = auth.SignInWithEmailAndPassword({ email: 'john@example.com', password: 'securepassword123' });

if (result.isSuccess) {
    console.log('User signed in:', result.value);
} else {
    console.error('Error signing in:', result.error);
}
```


## Examples

### Basic Authentication Flow
```js 
import FlareAuth from 'flareauth';

const auth = new FlareAuth();

// Signup
const signupResult = auth.SignupWithEmailAndPassword({ email: 'john@example.com', password: 'securepassword123' });
if (signupResult.isSuccess) {
    console.log('User signed up:', signupResult.value);
} else {
    console.error('Signup error:', signupResult.error);
}

// Login
const loginResult = auth.SignInWithEmailAndPassword({ email: 'john@example.com', password: 'securepassword123' });
if (loginResult.isSuccess) {
    console.log('User signed in:', loginResult.value);
} else {
    console.error('Login error:', loginResult.error);
}

```


## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests to improve the library.


## License

This library is licensed under the MIT License. See the LICENSE file for details.


## Contact

For support or inquiries, please email joshuamorka4@gmail.com.