/**
 * SeatSync Authentication Controller
 * Manages login, registration, role redirection, and session checks
 */
angular.module('seatSyncApp').controller('AuthController', ['$scope', '$window', 'ApiService', function ($scope, $window, ApiService) {
  $scope.loginData = {
    email: 'viraj.29022@stu.upes.ac.in',
    password: ''
  };

  $scope.registerData = {
    name: 'Viraj Kumar',
    email: 'viraj.29022@stu.upes.ac.in',
    studentId: '590029022',
    password: '',
    confirmPassword: ''
  };

  $scope.currentUser = null;
  $scope.isLoading = false;
  $scope.errorMessage = '';
  $scope.successMessage = '';

  // Quick helper: One-click sign in as Viraj Kumar
  $scope.fillAndSubmitViraj = function () {
    $scope.loginData.email = 'viraj.29022@stu.upes.ac.in';
    $scope.loginData.password = 'Password123';
    var emailEl = document.getElementById('login-email');
    var passEl = document.getElementById('login-password');
    if (emailEl) emailEl.value = 'viraj.29022@stu.upes.ac.in';
    if (passEl) passEl.value = 'Password123';
    $scope.submitLogin();
  };

  // Quick helper: One-click sign in as Admin
  $scope.fillAndSubmitAdmin = function () {
    $scope.loginData.email = 'admin@seatsync.edu';
    $scope.loginData.password = 'Admin1234';
    var emailEl = document.getElementById('login-email');
    var passEl = document.getElementById('login-password');
    if (emailEl) emailEl.value = 'admin@seatsync.edu';
    if (passEl) passEl.value = 'Admin1234';
    $scope.submitLogin();
  };

  // Sign In action - robust against browser autofill
  $scope.submitLogin = function () {
    // Read from ng-model or DOM value (solves browser autofill without input event)
    var emailEl = document.getElementById('login-email');
    var passEl = document.getElementById('login-password');

    var email = ($scope.loginData && $scope.loginData.email) || (emailEl ? emailEl.value : '');
    var password = ($scope.loginData && $scope.loginData.password) || (passEl ? passEl.value : '');

    email = (email || '').trim();
    password = (password || '').trim();

    if (!email || !password) {
      $scope.errorMessage = 'Please enter both your email and password.';
      return;
    }

    $scope.loginData.email = email;
    $scope.loginData.password = password;

    $scope.isLoading = true;
    $scope.errorMessage = '';
    $scope.successMessage = '';

    ApiService.login({ email: email, password: password })
      .then(function (response) {
        $scope.isLoading = false;
        $scope.currentUser = response.data.data;
        $scope.successMessage = 'Sign in successful! Redirecting to student portal...';

        setTimeout(function () {
          if ($scope.currentUser.role === 'admin') {
            $window.location.href = '/admin.html';
          } else {
            $window.location.href = '/student.html';
          }
        }, 500);
      })
      .catch(function (error) {
        $scope.isLoading = false;
        $scope.errorMessage = (error.data && error.data.message) ? error.data.message : 'Invalid login credentials.';
      });
  };

  // Register action
  $scope.submitRegister = function (isValid) {
    if (!isValid) {
      $scope.errorMessage = 'Please complete all required fields correctly.';
      return;
    }

    if ($scope.registerData.password !== $scope.registerData.confirmPassword) {
      $scope.errorMessage = 'Passwords do not match. Please re-enter.';
      return;
    }

    if ($scope.registerData.password.length < 6) {
      $scope.errorMessage = 'Password must be at least 6 characters.';
      return;
    }

    $scope.isLoading = true;
    $scope.errorMessage = '';
    $scope.successMessage = '';

    ApiService.register({
      name: $scope.registerData.name,
      email: $scope.registerData.email,
      studentId: $scope.registerData.studentId,
      password: $scope.registerData.password
    })
      .then(function (response) {
        $scope.isLoading = false;
        $scope.successMessage = 'Account created successfully! Redirecting to student dashboard...';
        setTimeout(function () {
          $window.location.href = '/student.html';
        }, 800);
      })
      .catch(function (error) {
        $scope.isLoading = false;
        $scope.errorMessage = (error.data && error.data.message) ? error.data.message : 'Registration failed.';
      });
  };

  // Sign Out action
  $scope.signOut = function () {
    ApiService.logout().finally(function () {
      $window.location.href = '/login.html';
    });
  };

  // Check current session on page load
  $scope.checkSession = function () {
    ApiService.getMe()
      .then(function (response) {
        $scope.currentUser = response.data.data;
      })
      .catch(function () {
        $scope.currentUser = null;
      });
  };

  $scope.checkSession();
}]);
