/**
 * SeatSync Authentication Controller
 * Manages login, registration, role redirection, and session checks
 */
angular.module('seatSyncApp').controller('AuthController', ['$scope', '$window', 'ApiService', function ($scope, $window, ApiService) {
  $scope.loginData = {
    email: '',
    password: ''
  };

  $scope.registerData = {
    name: '',
    email: '',
    studentId: '',
    password: '',
    confirmPassword: ''
  };

  $scope.currentUser = null;
  $scope.isLoading = false;
  $scope.errorMessage = '';
  $scope.successMessage = '';

  // Quick helper to prefill demo accounts for fast testing
  $scope.fillDemoStudent = function () {
    $scope.loginData.email = 'student@seatsync.edu';
    $scope.loginData.password = 'Student1234';
    $scope.errorMessage = '';
  };

  $scope.fillDemoAdmin = function () {
    $scope.loginData.email = 'admin@seatsync.edu';
    $scope.loginData.password = 'Admin1234';
    $scope.errorMessage = '';
  };

  // Sign In action
  $scope.submitLogin = function (isValid) {
    if (!isValid) {
      $scope.errorMessage = 'Please enter both your email and password.';
      return;
    }

    $scope.isLoading = true;
    $scope.errorMessage = '';
    $scope.successMessage = '';

    ApiService.login($scope.loginData)
      .then(function (response) {
        $scope.isLoading = false;
        $scope.currentUser = response.data.data;
        $scope.successMessage = 'Sign in successful! Redirecting...';

        setTimeout(function () {
          if ($scope.currentUser.role === 'admin') {
            $window.location.href = '/admin.html';
          } else {
            $window.location.href = '/student.html';
          }
        }, 600);
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
