/**
 * Initiates page and main functions
 */
async function main() {
    const worksList = await getWorksList()
    const categories = await getCategoryItems()

    displayWorksList(worksList)
    displayEditingGallery(worksList)
    selectCategoryItem(categories)

    setupFilterBtns()
    manageLogButton()
    manageEditMode()
    manageUploadBox()
    submitForm()

    toggleElementsBox(false)
}

/**
 * Displays a worklist in the DOM on the Homepage
 * @param {Array} worksList - Array of all the works to display
 */
function displayWorksList(worksList) {
    const gallery = document.querySelector(".gallery")

    worksList.forEach(work => {
        const figure = createGalleryFigure(work, true)
        gallery.appendChild(figure)
    });
}

/**
 * Creates worklist element as <figure>
 * @param {object} work - single element of worklist
 * @param {boolean} includeCaption - if it's on the Homepage, include caption
 * @returns {object} figure - HTML element containing <figure>, and the caption (= true)
 */
function createGalleryFigure(work, includeCaption = true) {
    const figure = document.createElement("figure")
    figure.dataset.id = work.id 
    figure.dataset.categoryId = work.categoryId
        
    const img = document.createElement("img")
    img.src = work.imageUrl
    img.alt = work.title
    figure.appendChild(img)
    
    if (includeCaption) {
        const figCaption = document.createElement("figcaption")
        figCaption.textContent = work.title
        figure.appendChild(figCaption)
    }
    
    return figure
}

/**
 * Sets up the Filter Buttons on Homepage (DOM only)
 * For each button apply filterGallery(categoryId) function params
 */
function setupFilterBtns() {
    const filterBtns = document.querySelectorAll(".filter-btn")

    filterBtns.forEach(button => {
        button.addEventListener("click", () => {
            filterGallery(button.dataset.categoryId)
        })
    })
}

/**
 * Filters gallery to show only <figure> elements matching selected category
 * @param {string} categoryId - ID of said category to filter by ("0" means show all)
 */
function filterGallery(categoryId) {
    let figures = document.querySelectorAll(".gallery figure")

    figures.forEach(figure => {
        if (categoryId === "0" || figure.dataset.categoryId === categoryId) {
            figure.classList.remove("hidden")
        } else {
            figure.classList.add("hidden")
        }
    })
}

/**
 * Checks if user is authenticated by looking for "token" in Local Storage
 * @returns {boolean} true/false - true if token exists / false if it doesn't
 */
function isUserAuthenticated() {
    const isAuthenticated = localStorage.getItem("token")

    if (!isAuthenticated) {
        return false
    }
    
    return true
}

/**
 * Manages "Login" button text and behaviour based on user authentication status
 * Changes button text to "logout" if user is logged in, otherwise "login"
 * Adds click event to either log out (clear storage and refresh) or redirect to login page
 */
function manageLogButton() {
    const logButton = document.getElementById("login-button")
    
    if (isUserAuthenticated() == true ) {
        logButton.textContent = "logout" 
    } else {
        logButton.textContent = "login"
    }
    
    logButton.addEventListener("click", () => {
        if (isUserAuthenticated() == true) {
            localStorage.clear()
            window.location.href = "index.html"
        } else {
            window.location.href = "login.html"
        }
    })
}

/**
 * Manages edit mode by applying changes when the user is logged in
 */
function manageEditMode() {
    const isAuth = isUserAuthenticated()
    toggleElementClasses(isAuth)
    manageAddPhotoBtn()
    switchPopupMode(false)
    setupEditButton()
    manageFormContent()
}

/**
 * Toggles CSS classes on Homepage based on user authentication status
 * Shows or hides "Mode édition" banner, modify button, header margins and filter buttons accordingly
 * @param {boolean} isAuthenticated - applying changes whether user is logged in or not
 */
function toggleElementClasses(isAuthenticated) {
    const editModeBanner = document.querySelector(".edit-mode")
    const modifyButton = document.querySelector(".modify-button")
    const pageHeader = document.querySelector("header")
    const sectionHeader = document.querySelector(".section-header")
    const filterBox = document.querySelector(".button-box")

    editModeBanner.classList.toggle("hidden", !isAuthenticated)
    modifyButton.classList.toggle("hidden", !isAuthenticated)
    pageHeader.classList.toggle("margin-header", isAuthenticated)
    sectionHeader.classList.toggle("section-header", isAuthenticated)
    filterBox.classList.toggle("hidden", isAuthenticated)
}

/**
 * Sets up the edit button to listen for clicks
 * When modifyButton is clicked, shows overlay and disables scrolling
 * When overlay is clicked (outside popup), closes popup window
 * When closeButton is clicked, also closes popup window
 */
function setupEditButton() {
    const modifyButton = document.querySelector(".modify-button")
    const overlay = document.querySelector(".overlay")
    const closeButton = document.querySelector(".close-popup")

    modifyButton.addEventListener("click", () => {
        overlay.style.display = "flex";
        document.body.style.overflow = "hidden";
    })

    overlay.addEventListener("click", (event) => {
        if (event.target === overlay) {
            closeOverlay(overlay)
        }
    })

    closeButton.addEventListener("click", () => {
        closeOverlay(overlay)
    })
}

/**
 * Closes overlay popup and resets related states
 * Hides overlay, re-enables scrolling, resets popup mode and form content
 * @param {HTMLElement} overlay - overlay element to hide
 */
function closeOverlay(overlay) {
    overlay.style.display = "none"
    document.body.style.overflow = ""
    switchPopupMode(false)
    resetForm()
}

/**
 * Displays editable gallery in popup window
 * Creates figure for each work (without caption) and adds delete button
 * @param {Array} worklist - Array of works to display in edit mode
 */
function displayEditingGallery(worklist) {
    const editGallery = document.querySelector(".edit-gallery")

    worklist.forEach(work => {
        const figure = createGalleryFigure(work, false)
        const deleteBtn = manageDeleteButton(work, figure)
        
        figure.appendChild(deleteBtn)
        editGallery.appendChild(figure)
    });
}

/**
 * Creates deleteBtn for each work and handles delete behaviour
 * Sends delete request to api when clicked, and removes figure from both Homepage and Edit Gallery popup
 * @param {object} work - work item to delete (with ID and title)
 * @param {HTMLElement} figure - element to remove from edit gallery
 * @returns {HTMLButtonElement} deleteBtn - delete button element, to use for other functions
 */
function manageDeleteButton(work, figure) {
    const deleteBtn = document.createElement("button")
    deleteBtn.classList.add("delete-btn")
    deleteBtn.innerHTML = '<i class="fa-solid fa-trash-can"></i>'

    deleteBtn.addEventListener("click", async () => {

        let response = await doDeleteRequest(work.id)

        if (response.ok) {
            figure.remove()
            const mainFigure = document.querySelector(`.gallery figure[data-id="${work.id}"]`)
            if (mainFigure) {
                mainFigure.remove()
            }
        }
        console.log("you clicked delete on: ", work.title, " | id :", work.id)
    })
    return deleteBtn
}

/**
 * Manages addPhotoBtn button and goBackBtn button in popup
 * Switches to upload photo form when addPhotoBtn is clicked
 * Returns to edit gallery and resets form goBackBtn is clicked
 */
function manageAddPhotoBtn() {
    const addPhotoBtn = document.getElementById("popup-btn")
    const goBackBtn = document.querySelector(".go-back")

    addPhotoBtn.addEventListener("click", () => {
        switchPopupMode(true)
    })

    goBackBtn.addEventListener("click", () => {
        switchPopupMode(false)
        resetForm()
    })
}

/**
 * Switches between Edit Gallery view and Add Photo view in popup
 * Calls functions to update icons, title, buttons, and gallery content
 * @param {boolean} isAddPhotoMode - true to show Add Photo form, false to show Edit Gallery
 */
function switchPopupMode(isAddPhotoMode) {
    managePopupIcons(isAddPhotoMode)
    manageEditGallery(isAddPhotoMode)
    managePopupTitle(isAddPhotoMode)
    managePopupBtn(isAddPhotoMode)
}

/**
 * Updates popup icon layout and goBackBtn visibility based on current popup mode
 * @param {boolean} isAddPhotoMode - true for Add Photo mode, false for Edit Gallery mode
 */
function managePopupIcons(isAddPhotoMode) {
    const popupIcons = document.querySelector(".popup-icons")
    const goBackBtn = document.querySelector(".go-back")

    if (isAddPhotoMode) {
        popupIcons.style.justifyContent = "space-between"
        goBackBtn.classList.remove("hidden")
    } else {
        popupIcons.style.justifyContent = "flex-end"
        goBackBtn.classList.add("hidden")
    }
}

/**
 * Toggles visibility between Edit Gallery view and Add Photo form in popup
 * @param {boolean} isAddPhotoMode - true to show Add Photo form, false to show Edit Gallery
 */
function manageEditGallery(isAddPhotoMode) {
    const editGallery = document.querySelector(".edit-gallery")
    const addPhotoMode = document.querySelector(".add-photo-mode")

    if (isAddPhotoMode) {
        editGallery.classList.add("hidden")
        addPhotoMode.classList.remove("hidden")
    } else {
        editGallery.classList.remove("hidden")
        addPhotoMode.classList.add("hidden")
    }
}

/**
 * Updates popup title based on current mode
 * @param {boolean} isAddPhotoMode - true to show "Ajout Photo" title, false to show "Galerie photo"
 */
function managePopupTitle(isAddPhotoMode) {
    const popupTitle = document.getElementById("popup-title")

    if (isAddPhotoMode) {
        popupTitle.innerHTML = "Ajout Photo"
    } else {
        popupTitle.innerHTML = "Galerie photo"
    }
}

/**
 * Moves popup elements and triggers appropriate button setup based on current popup mode
 * @param {boolean} isAddPhotoMode - true for Add Photo mode, false for Edit Gallery mode
 */
function managePopupBtn(isAddPhotoMode) {
    const popupBox = document.querySelector(".popup-box")
    const form = document.querySelector(".add-photo-mode")
    const fineLine = document.querySelector(".fine-line")
    const popupBtn = document.getElementById("popup-btn")

    if (isAddPhotoMode) {
        form.appendChild(fineLine)
        form.appendChild(popupBtn)
        validateBtnPending()
    } else {
        popupBox.appendChild(fineLine)
        popupBox.appendChild(popupBtn)
        addPhotoBtn()
    }
}

/**
 * Sets popup button to visual pending validation state with CSS
 */
function validateBtnPending() {
    const validateBtn = document.getElementById("popup-btn")
    validateBtn.classList.remove("add-button")
    validateBtn.classList.add("validate-btn-pending")
    validateBtn.setAttribute("type", "submit")
    validateBtn.innerHTML = "Valider"
}

/**
 * Sets popup button to "Add Photo" state, removing CSS "validate" and "pending" states
 */
function addPhotoBtn() {
    const addPhotoBtn = document.getElementById("popup-btn")
    addPhotoBtn.classList.add("add-button")
    addPhotoBtn.classList.remove("validate-button")
    addPhotoBtn.classList.remove("validate-button-pending")
    addPhotoBtn.setAttribute("type", "button")
    addPhotoBtn.innerHTML = "Ajouter une photo"
}

/**
 * Toggles visibility of upload box elements based on photo and upload status
 * @param {boolean} isPhotoUploaded - true if a photo is uploaded, false otherwise
 */
function toggleElementsBox(isPhotoUploaded) {
    const icon = document.querySelector(".fa-image")
    const addPhotoTxt = document.getElementById("add-photo-txt")
    const addPhotoSubtxt = document.getElementById("add-photo-subtxt")
    const preview = document.getElementById("preview")

    if (isPhotoUploaded) {
        icon.classList.add("hidden")
        addPhotoTxt.classList.add("hidden")
        addPhotoSubtxt.classList.add("hidden")
        preview.classList.remove("hidden")
    } else {
        icon.classList.remove("hidden")
        addPhotoTxt.classList.remove("hidden")
        addPhotoSubtxt.classList.remove("hidden")
        preview.classList.add("hidden")
    }
}

/**
 * Handles photo upload input:
 * - Shows preview of uploaded image
 * - Checks file size (max 4MB) and alerts if exceeded
 * - Toggles upload elements visibility accordingly
 */
function manageUploadBox() {
    const photoInput = document.getElementById("photo-input")
    const preview = document.getElementById("preview")
    const reader = new FileReader()

    photoInput.addEventListener("change", () => {
        toggleElementsBox(true)
        const file = photoInput.files[0]

        if (file && file.size > 4 * 1024 * 1024) { // = 4 Mo 
            alert("Le fichier dépasse la taille maximale de 4 Mo.")
            toggleElementsBox(false)
            photoInput.value = ""
            return
        }

        reader.onload = (e) => {
            const img = document.createElement("img")
            img.src = e.target.result
            preview.appendChild(img)
        }
        reader.readAsDataURL(file)
    })
}

/**
 * Resets form if popup mode is not in "Add Photo" mode (e.g., when you go back or close popup)
 */
function manageFormContent() {
    if(switchPopupMode(false)) {
        resetForm()
    }
}

/**
 * Displays categories fetched from API on <select> for user to bind to said category 
 * @param {Array} categories - Array of category objects with id and name
 */
async function selectCategoryItem(categories) {
    const select = document.getElementById("photo-category")

    categories.forEach(category => {
        const option = document.createElement("option")
        option.value = category.id
        option.textContent = category.name
        select.appendChild(option)
    })
}

/**
 * Resets the photo upload form:
 * - Clears all input fields and preview area / (1) & (2)
 * - Resets submit button state and visibility of related elements / (3)
 */
function resetForm() {
    const fileInput = document.getElementById("photo-input")
    const titleInput = document.getElementById("photo-title")
    const categorySelect = document.getElementById("photo-category")
    const preview = document.getElementById("preview")
    const submitBtn = document.getElementById("popup-btn")

    // (1)
    fileInput.value = ""
    titleInput.value = ""
    categorySelect.value = ""

    // (2)
    preview.innerHTML = ""

    // (3)
    submitBtn.classList.remove("validate-btn")
    submitBtn.classList.remove("validate-btn-pending")
    submitBtn.disabled = false
    toggleElementsBox(false)
}

/**
 * Validates form inputs and updates submit button state
 * Enables button if all inputs are filled, disables it otherwise
 */
function validateFormBtn() {
    const fileInput = document.getElementById("photo-input")
    const titleInput = document.getElementById("photo-title")
    const categorySelect = document.getElementById("photo-category")
    const submitBtn = document.getElementById("popup-btn")

    const file = fileInput.files[0]
    const title = titleInput.value.trim()
    const category = categorySelect.value

    const isValid = file && title !== "" && category !== ""

    if (isValid) {
        submitBtn.classList.remove("validate-btn-pending")
        submitBtn.classList.add("validate-btn")
        submitBtn.disabled = false
    } else {
        submitBtn.classList.remove("validate-btn")
        submitBtn.classList.add("validate-btn-pending")
        submitBtn.disabled = true
    }
}

/**
 * Handles form submission for uploading a photo
 * Validates inputs on change/input events
 * On submit, prevents default and sends photo data to API
 * If successful, updates both Edit gallery and Homepage and resets form
 * Shows alerts on success or failure
 */
function submitForm() {
    const fileInput = document.getElementById("photo-input")
    const titleInput = document.getElementById("photo-title")
    const categorySelect = document.getElementById("photo-category")
    const submitBtn = document.getElementById("popup-btn")

    fileInput.addEventListener("change", validateFormBtn)
    titleInput.addEventListener("input", validateFormBtn)
    categorySelect.addEventListener("change", validateFormBtn)

    submitBtn.addEventListener('click', async (event) => {
        event.preventDefault()

        const file = fileInput.files[0]
        const title = titleInput.value.trim()
        const category = categorySelect.value

        if (file && title !== "" && category !== "") {
            const response = await uploadPhoto(file, title, category)
            const newWork = await response.json()

            const gallery = document.querySelector(".gallery")
            const figure = createGalleryFigure(newWork, true)
            const editGallery = document.querySelector(".edit-gallery")
            const editFigure = createGalleryFigure(newWork, false)
            const deleteBtn = manageDeleteButton(newWork, editFigure)
            const overlay = document.querySelector(".overlay")

            if (response.ok) {
                gallery.appendChild(figure)
                editFigure.appendChild(deleteBtn)
                editGallery.appendChild(editFigure)
                closeOverlay(overlay)
                resetForm()
                alert('Ajout Photo Validé !')
            }

            if (!response.ok) {
                alert("Erreur lors de l'envoi : " + response.status + " " + response.statusText)
            }
        }
    })
}

main()