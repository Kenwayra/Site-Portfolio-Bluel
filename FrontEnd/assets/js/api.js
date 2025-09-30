//Get worklist from Backend
async function getWorksList() {
    let response = await fetch("http://localhost:5678/api/works")
    let worksList = await response.json()

    return worksList
}

// Get Categories from Backend
async function getCategoryItems() {
    const response = await fetch("http://localhost:5678/api/categories")
    let categories = await response.json()

    return categories
}

//Fetch Login Authentification from Backend
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

//Request User Login with Token
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

// Send New Photo to Backend
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