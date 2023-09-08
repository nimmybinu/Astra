document.addEventListener("DOMContentLoaded", function() {
    var form = document.getElementById("login-form");
    form.addEventListener("submit", function(event) {
        event.preventDefault(); 
        console.log("Form submission attempted");
       
        var emailInput = document.getElementById("email");
        var passwordInput = document.getElementById("password");
        console.log("Email:", emailInput.value);
        console.log("Password:", passwordInput.value);
        var emailError = document.getElementById("email-error");
        var passwordError = document.getElementById("password-error");
      
        emailError.textContent = "";
        passwordError.textContent = "";
        
        var isValid = true;
        
        
        var emailRegex = /^\S+@\S+\.\S+$/;
        
        if (!emailRegex.test(emailInput.value)) {
            emailError.textContent = "Enter a valid email address";
            isValid = false;
        }
        
        if (passwordInput.value.length < 4) {
            passwordError.textContent = "Password must be at least 4 characters";
            isValid = false;
        }
      
        if (isValid) {
            form.submit();
        }
    });
});



