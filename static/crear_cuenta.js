const password = document.getElementById("password");
const botonPassword = document.getElementById("show-password");

botonPassword.addEventListener("click", function () {

    if (password.type === "password") {

        password.type = "text";

    } else {

        password.type = "password";

    }

});