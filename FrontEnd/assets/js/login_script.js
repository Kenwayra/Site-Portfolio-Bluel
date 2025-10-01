/**
 * Initialise login form to validate inputs and handle submission
 */
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

/**
 * Sends login request to api and handles response, saving token on success or showing error message on failure
 * @param {string} email - user's email
 * @param {string} password - user's password
 */
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

/**
 * Validates email string with regex pattern
 * @param {string} email - user's email
 * @returns {boolean} true if email format is valid, false otherwise
 */
function isEmailValid(email) {
    let emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]{2,}\.[a-z]{2,4}$/;
    if (emailRegex.test(email)) {
        return true;
    }
    return false;
}

/**
 * Validates password string with regex pattern
 * @param {string} password - user's password
 * @returns true if password format is valid, false otherwise
 */
function isPasswordValid(password) {
    let passwordRegex = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{5,}$/;
    if (passwordRegex.test(password)) {
        return true;
    }
    return false;
}

/**
 * Displays or hides error message based on valid email or not
 * @param {string} email - user's email
 * @param {HTMLElement} emailField - input field element for email
 * @returns {boolean} true if email is valid, false otherwise
 */
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

/**
 * Displays or hides error message based on valid password or not
 * @param {string} password - user's password
 * @param {HTMLElement} passwordField - input field element for password
 * @returns {boolean} true if password is valid, false otherwise
 */
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


/**
 * Displays password when toggle button is clicked
 * @param {HTMLElement} passwordField - input field element for password
 */
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

/**
 * Displays error message if login failed
 * @param {string} message - api response as a text content
 */
function displayLoginErrorMessage(message) {
    const loginError = document.getElementById("login-error")
    loginError.textContent = message
}

/**
 * Displays error message if password or email is invalid
 * @param {HTMLElement} idWrongField - selects field under "password" or "email"
 * @param {string} message - displays personalised error message typed
 */
function displayErrorMessage(idWrongField, message) {
    const wrongField = document.querySelector(idWrongField)
    wrongField.textContent = message
}

/**
 * Removes displayed error message
 * @param {HTMLElement} idWrongField - selects field under "password" or "email"
 * @param {string} message - removes personalised error message typed 
 */
function removeErrorMessage(idWrongField, message) {
    const wrongField = document.querySelector(idWrongField)
    wrongField.textContent = message
    message = ""
}

/**
 * Displays visual indication of error with CSS class
 * @param {HTMLElement} input - input inside login form containing invalid content
 */
function displayErrorBorder(input) {
    input.classList.add("error-border")
}

/**
 * Removes CSS class displaying visual indication of error
 * @param {HTMLElement} input - input inside login form containing now valid content 
 */
function removeErrorBorder(input) {
    input.classList.remove("error-border")
}

initLoginPage()