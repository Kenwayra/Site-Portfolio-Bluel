//Initiate Page 
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
 * affiche tableau/array des travaux
 * @param {Array} worksList 
 */
function displayWorksList(worksList) {
    const gallery = document.querySelector(".gallery")

    worksList.forEach(work => {
        const figure = createGalleryFigure(work, true)
        gallery.appendChild(figure)
    });
}

/**
 * Créer une galerie 
 * @param {object} work 
 * @param {boolean} includeCaption 
 * @returns figure
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

// Filters
function setupFilterBtns() {
    const filterBtns = document.querySelectorAll(".filter-btn")

    filterBtns.forEach(button => {
        button.addEventListener("click", () => {
            filterGallery(button.dataset.categoryId)
        })
    })
}

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

// User Authentification
function isUserAuthenticated() {
    const isAuthenticated = localStorage.getItem("token")

    if (!isAuthenticated) {
        return false
    }
    
    return true
}

function manageLogButton() {
    const logButton = document.getElementById("login-button")
    
    if (isUserAuthenticated() == true ) {
        logButton.textContent = "logout" 
    } else {
        logButton.textContent = "login"
    }
    
    logButton.addEventListener("click", () => {
        if (isUserAuthenticated() == true) {
            //on est en mode logout
            localStorage.clear()
            window.location.href = "index.html"
        } else {
            //on est en mode login
            window.location.href = "login.html"
        }
    })
}

// Edit Mode
function manageEditMode() {
    const isAuth = isUserAuthenticated()
    toggleElementClasses(isAuth)
    manageAddPhotoBtn()
    switchPopupMode(false)
    setupEditButton()
    manageFormContent()
}

function toggleElementClasses(isAuthenticated) {
    const editModeBanner = document.querySelector(".edit-mode")
    const modifyButton = document.querySelector(".modify-button")
    const pageHeader = document.querySelector("header")
    const sectionHeader = document.querySelector(".section-header")
    const filterBox = document.querySelector(".button-box")

    editModeBanner.classList.toggle("hidden", !isAuthenticated)        // Affichage de la banière "Mode édition"
    modifyButton.classList.toggle("hidden", !isAuthenticated)          // Affichage du bouton "Modifier"
    pageHeader.classList.toggle("margin-header", isAuthenticated)      //Change Affichage de la Margin Header
    sectionHeader.classList.toggle("section-header", isAuthenticated)  //Change Affichage de Section Header "Mes projets"
    filterBox.classList.toggle("hidden", isAuthenticated)              // Affichage des boutons Filtres
}

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
            closeOverlay(overlay) // ferme overlay sans cliquer sur la croix
        }
    })

    closeButton.addEventListener("click", () => {
        closeOverlay(overlay)
    })
}

function closeOverlay(overlay) {
    overlay.style.display = "none"
    document.body.style.overflow = ""
    switchPopupMode(false)
    resetForm()
}

function displayEditingGallery(worklist) {
    const editGallery = document.querySelector(".edit-gallery")

    worklist.forEach(work => {
        const figure = createGalleryFigure(work, false) // Pas de FigCaption
        const deleteBtn = manageDeleteButton(work, figure)
        
        figure.appendChild(deleteBtn)
        editGallery.appendChild(figure)
    });
}

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

// Add Photo popup

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

function switchPopupMode(isAddPhotoMode) {
    managePopupIcons(isAddPhotoMode)
    manageEditGallery(isAddPhotoMode)
    managePopupTitle(isAddPhotoMode)
    managePopupBtn(isAddPhotoMode)
}

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

function managePopupTitle(isAddPhotoMode) {
    const popupTitle = document.getElementById("popup-title")

    if (isAddPhotoMode) {
        popupTitle.innerHTML = "Ajout Photo"
    } else {
        popupTitle.innerHTML = "Galerie photo"
    }
}

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

function validateBtnPending() {
    const validateBtn = document.getElementById("popup-btn")
    validateBtn.classList.remove("add-button")
    validateBtn.classList.add("validate-btn-pending")
    validateBtn.setAttribute("type", "submit")
    validateBtn.innerHTML = "Valider"
}

function addPhotoBtn() {
    const addPhotoBtn = document.getElementById("popup-btn")
    addPhotoBtn.classList.add("add-button")
    addPhotoBtn.classList.remove("validate-button")
    addPhotoBtn.classList.remove("validate-button-pending")
    addPhotoBtn.setAttribute("type", "button")
    addPhotoBtn.innerHTML = "Ajouter une photo"
}

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

function manageFormContent() {
    if(switchPopupMode(false)) {
        resetForm()
    }
}

async function selectCategoryItem(categories) {
    const select = document.getElementById("photo-category")

    categories.forEach(category => {
        const option = document.createElement("option")
        option.value = category.id
        option.textContent = category.name
        select.appendChild(option)
    })
}

function resetForm() {
    const fileInput = document.getElementById("photo-input")
    const titleInput = document.getElementById("photo-title")
    const categorySelect = document.getElementById("photo-category")
    const preview = document.getElementById("preview")
    const submitBtn = document.getElementById("popup-btn")

    // Vide tous les champs
    fileInput.value = ""
    titleInput.value = ""
    categorySelect.value = ""

    // Vide l'aperçu
    preview.innerHTML = ""

    // Réinitialise le bouton
    submitBtn.classList.remove("validate-btn")
    submitBtn.classList.remove("validate-btn-pending")
    submitBtn.disabled = false
    toggleElementsBox(false)
}


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