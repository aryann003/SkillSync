const BASE_URL = "http://127.0.0.1:8000/api";

let accessToken = localStorage.getItem("accessToken");

function showResponse(data) {
    document.getElementById("responseBox").innerText =
        JSON.stringify(data, null, 2);
}

async function registerUser() {
    const username = document.getElementById("regUsername").value;
    const email = document.getElementById("regEmail").value;
    const password = document.getElementById("regPassword").value;

    const response = await fetch(`${BASE_URL}/register/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            username: username,
            email: email,
            password: password
        })
    });

    const data = await response.json();
    showResponse(data);
}

async function loginUser() {
    const username = document.getElementById("loginUsername").value;
    const password = document.getElementById("loginPassword").value;

    const response = await fetch(`${BASE_URL}/token/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            username: username,
            password: password
        })
    });

    const data = await response.json();

    if (data.access) {
        accessToken = data.access;
        localStorage.setItem("accessToken", accessToken);
    }

    showResponse(data);
}

async function createPost() {
    const title = document.getElementById("postTitle").value;
    const content = document.getElementById("postContent").value;

    const response = await fetch(`${BASE_URL}/posts/create/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`
        },
        body: JSON.stringify({
            title: title,
            content: content
        })
    });

    const data = await response.json();
    showResponse(data);
}

async function searchUsers() {
    const query = document.getElementById("searchQuery").value;

    const response = await fetch(`${BASE_URL}/search/users/?q=${query}`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${accessToken}`
        }
    });

    const data = await response.json();
    showResponse(data);
}

async function createCommunity() {
    const name = document.getElementById("communityName").value;
    const description = document.getElementById("communityDescription").value;

    const response = await fetch(`${BASE_URL}/communities/create/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`
        },
        body: JSON.stringify({
            name: name,
            description: description
        })
    });

    const data = await response.json();
    showResponse(data);
}