/* Login, registration and sign out.
   Each function calls the API and uses the result to update the page. */
angular.module('seatSyncApp').controller('AuthController', ['$scope', '$window', 'ApiService',
  function ($scope, $window, ApiService) {

    $scope.loginData = { email: '', password: '' };
    $scope.registerData = { name: '', email: '', studentId: '', password: '', confirmPassword: '' };
    $scope.currentUser = null;
    $scope.errorMessage = '';
    $scope.isLoading = false;

    // Ask the server who is logged in (the session cookie is sent automatically)
    ApiService.getMe()
      .then(function (response) { $scope.currentUser = response.data.data; })
      .catch(function () { $scope.currentUser = null; });

    $scope.submitLogin = function () {
      $scope.errorMessage = '';
      $scope.isLoading = true;

      ApiService.login($scope.loginData)
        .then(function (response) {
          var user = response.data.data;
          $window.location.href = user.role === 'admin' ? '/admin.html' : '/student.html';
        })
        .catch(function (error) {
          $scope.isLoading = false;
          $scope.errorMessage = (error.data && error.data.message) || 'Login failed.';
        });
    };

    // Demo buttons for the viva: fill in the test account and log in
    $scope.fillAndSubmit = function (email, password) {
      $scope.loginData.email = email;
      $scope.loginData.password = password;
      $scope.submitLogin();
    };

    $scope.submitRegister = function (isValid) {
      $scope.errorMessage = '';
      if (!isValid) {
        $scope.errorMessage = 'Please fill in all fields correctly.';
        return;
      }
      if ($scope.registerData.password !== $scope.registerData.confirmPassword) {
        $scope.errorMessage = 'Passwords do not match.';
        return;
      }

      $scope.isLoading = true;
      ApiService.register({
        name: $scope.registerData.name,
        email: $scope.registerData.email,
        studentId: $scope.registerData.studentId,
        password: $scope.registerData.password
      })
        .then(function () { $window.location.href = '/student.html'; })
        .catch(function (error) {
          $scope.isLoading = false;
          $scope.errorMessage = (error.data && error.data.message) || 'Registration failed.';
        });
    };

    $scope.signOut = function () {
      ApiService.logout().finally(function () {
        $window.location.href = '/login.html';
      });
    };
  }
]);
