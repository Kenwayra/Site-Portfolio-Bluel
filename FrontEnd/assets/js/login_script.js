// Iniate Login, Form
function initLoginPage() {
    const registrationForm = document.getElementById("register-form")

    const passwordField = document.getElementById("password")
    displayPassword(passwordField) 
    
    registrationForm.addEventListener("submit", (event) => {

        event.preventDefault()
        const emailField = document.getElementById("email")
        const email = emailField.value
        const password = passwordField.value

        const emailIsOK = validateEmail(email, emailField)
        const passwordIsOK = validatePassword(password, passwordField)

        if (emailIsOK && passwordIsOK) {
            doLogin(email, password)
        }
    })
}

async function doLogin(email, password) {
    try {
        let response = await doLoginRequest(email, password)
    
        if (response.status == 200) {
            const data = await response.json();
            localStorage.setItem("token", data.token)
            window.location.href = "index.html";
        } else {
            displayLoginErrorMessage("Connexion impossible : Veuillez vérifier vos identifiants.")
        }

    } catch (error) {
        displayLoginErrorMessage("Erreur : " + error.message)
    }
}


// Validate Data
function isEmailValid(email) {
    let emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]{2,}\.[a-z]{2,4}$/;
    if (emailRegex.test(email)) {
        return true;
    }
    return false;
}

function isPasswordValid(password) {
    let passwordRegex = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{5,}$/;
    if (passwordRegex.test(password)) {
        return true;
    }
    return false;
}

function validateEmail(email, emailField) {
    if (!isEmailValid(email)) {
        displayErrorBorder(emailField)
        displayErrorMessage("#email-wrong", "Veuillez saisir un email valide");
        return false;
    } else {
        removeErrorBorder(emailField)
        removeErrorMessage("#email-wrong")
        return true;
    }
}

function validatePassword(password, passwordField) {
    if (!isPasswordValid(password)) {
        displayErrorBorder(passwordField)
        displayErrorMessage("#password-wrong", "Veuillez saisir un mot de passe valide");
        return false;
    } else {
        removeErrorBorder(passwordField)
        removeErrorMessage("#password-wrong")
        return true;
    }
}


//Display Elements
function displayPassword(passwordField) {
    const toggleButton = document.getElementById("toggle-button");

    toggleButton.addEventListener("mousedown", () => {
        passwordField.type = "text";
    });

    toggleButton.addEventListener("mouseup", () => {
        passwordField.type = "password";
    });

    toggleButton.addEventListener("mouseleave", () => {
        passwordField.type = "password";
    });
}

function displayLoginErrorMessage(message) {
    const loginError = document.getElementById("login-error")
    loginError.textContent = message
}

function displayErrorMessage(idWrongField, message) {
    const wrongField = document.querySelector(idWrongField)
    wrongField.textContent = message
}

function removeErrorMessage(idWrongField, message) {
    const wrongField = document.querySelector(idWrongField)
    wrongField.textContent = message
    message = ""
}

function displayErrorBorder(input) {
    input.classList.add("error-border")
}

function removeErrorBorder(input) {
    input.classList.remove("error-border")
}

initLoginPage()