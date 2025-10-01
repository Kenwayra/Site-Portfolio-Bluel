/**
 * Fetches worklist from backend
 * @returns {Array} worklist - to later display on DOM
 */
async function getWorksList() {
    let response = await fetch("http://localhost:5678/api/works")
    let worksList = await response.json()

    return worksList
}

/**
 * Fetches categories from backend
 * @returns {Array} categories - to later display on <select> and bind photo to said category
 */
async function getCategoryItems() {
    const response = await fetch("http://localhost:5678/api/categories")
    let categories = await response.json()

    return categories
}

/**
 * Does a login request to API, checking for valid authentication
 * @param {string} email - user's email
 * @param {string} password - user's email
 * @returns {Promise} - API response from backend
 */
async function doLoginRequest(email, password) {
    const response = await fetch("http://localhost:5678/api/users/login", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({email, password})
    })
    return response
}

/**
 * Sends a delete work request to API by giving work ID
 * Checks if user is authorised to make said request by retrieving 'token' from local storage
 * @param {string} id - ID of selected work for delete request
 * @returns {Promise} - API response from backend
 */
async function doDeleteRequest(id) {
    const token = localStorage.getItem("token")
    let response = await fetch(`http://localhost:5678/api/works/${id}`, {
        method: "DELETE",
        headers: {
            'Authorization': `Bearer ${token}`
        } 
    })
    return response
}

/**
 * Sends Add Photo request to backend, requires token
 * Sends new work, as well as its title and category
 * @param {object} file - work as img file
 * @param {string} title - title of said work
 * @param {object} category - category of said work
 * @returns {Promise} - API response from backend
 */
async function uploadPhoto(file, title, category) {
    const token = localStorage.getItem("token")
    const formData = new FormData()

    formData.append("image", file)
    formData.append("title", title)
    formData.append("category", category)

    const response = await fetch("http://localhost:5678/api/works", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`
        },
        body: formData
    })
    return response
}