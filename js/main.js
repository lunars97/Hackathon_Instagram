const postsList = document.querySelector(".post-list");
const addPostForm = document.querySelector(".add-post-form");
const url = "http://localhost:8000/posts/";
const titleValue = document.getElementById("title-value");
const bodyValue = document.getElementById("body-value");
const imageValue = document.getElementById('image-value');
let searchValue = document.getElementById('search-value');
const btnSubmit = document.querySelector(".btn");
let searchText = '';
let idToEdit = '';

const renderPosts = (urlToRender) => {
    fetch(url + `?q=${searchValue.value}`)
        .then(res => res.json())
        .then(foundData => {
            postsList.innerHTML = '';

            foundData.forEach((post) => {
                if (!post.comments) post.comments = ['Нет комментариев'];
                let newPostDiv = document.createElement('div');
                newPostDiv.classList.add('card', 'mt-4', 'col-md-6', 'bg-light');
                newPostDiv.innerHTML = `
                    <div class="card-body" data-id=${post.id}>
                    <img class="card-image" src="${post.image}"/>    
                    <h5 class="card-title">${post.title}</h5>
                    <h6 class="card-subtitle mb-2 text-muted">
                    ${post.date}
                    </h6>
                    <p class="card-text">
                    ${post.body}
                    </p>
                    <a href="#" class="card-link" id="edit">✎</a>
                    <a href="#" class="card-link" id="delete-post">🗑</a>
                    <a href="#" class="card-link" id="like-post">❤️</a>
                    <span class="card-text">
                    ${post.likes}
                    </span>
                    <ul>${post.comments.reduce((comments, elem) => {
                    return comments + '<li>- ' + elem + '</li>'
                }, '💬 Comments:')}</ul>
                    <label for="title">Add comment:</label>
                    <input type="text" class="form-control" id="comment-inp" />
                    <a href="#" class="card-link" id="comment-post">Save comment ➤</a>
                    </div>
                 `;
                postsList.append(newPostDiv);
            });
        });
};
//get - read posts
// Method: GET
fetch(url)
    .then((res) => res.json())
    .then((data) => renderPosts(url));

postsList.addEventListener("click", (e) => {
    // console.log(e.target.id);
    e.preventDefault();
    let delBtn = e.target.id == "delete-post";
    let editBtn = e.target.id == "edit";
    let likeBtn = e.target.id == "like-post";
    let commentBtn = e.target.id == "comment-post";

    let id = e.target.parentElement.dataset.id;
    // console.log(e.target.parentElement.dataset.id); ---- to check id
    // DELETE - REMOVE THE EXISTING POST
    // METHOD "DELETE"

    if (delBtn) {
        // console.log("remove");
        fetch(url + id, {
            method: "DELETE",
        })
            .then((res) => res.json())
            .then(() => renderPosts(url));
    }

    if (editBtn) {
        document.getElementById('myModal').style.display = 'block';
        // console.log("edit");
        const parent = e.target.parentElement;
        idToEdit = e.target.parentElement.dataset.id;
        console.log(idToEdit);
        document.querySelector('#modal-title-value').value = parent.querySelector(".card-title").textContent; // from html
        document.querySelector('#modal-body-value').value = parent.querySelector(".card-text").textContent; // body content from html
        document.querySelector('#modal-image-value').value = parent.querySelector(".card-image").getAttribute('src');; // image content from html
        // console.log("title");
    }

    if (likeBtn) {
        fetch(url + id)
            .then(res => res.json())
            .then(data => {
                let newLikesVal = Math.floor(data.likes);
                newLikesVal += 1;
                data.likes = newLikesVal;
                fetch(url + id, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                }).then(() => renderPosts(url));
            });
    }
    if (commentBtn) {
        fetch(url + id)
            .then(res => res.json())
            .then(data => {
                let newComment = $('#comment-inp').val();
                if (!data.comments) {
                    let commentsArr = [];
                    commentsArr.push(newComment);
                    data.comments = commentsArr;
                } else {
                    data.comments.push(newComment);
                }
                fetch(url + id, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                }).then(() => renderPosts(url));
            });
    }

    // UPDATE - update the existing post
    // METHOD: PATCH
    btnSubmit.addEventListener("click", (e) => {
        e.preventDefault();
        // console.log("updated");
        fetch(url, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                title: titleValue.value,
                body: bodyValue.value,
                image: imageValue.value,
                date: new Date().toJSON().slice(0, 10).replace(/-/g, '-'),
                likes: 0,
                comments: null
            }),
        })
            .then((res) => res.json())
            .then(() => location.reload());
    });
});
document.querySelector('.close').addEventListener('click', () => {
    document.getElementById('myModal').style.display = 'none';
});
document.querySelector('#modal-save-btn').addEventListener('click', () => {
    let updatedPost = {};
    fetch(url + idToEdit)
        .then(res => res.json())
        .then(data => {
            updatedPost.title = document.querySelector('#modal-title-value').value;
            updatedPost.body = document.querySelector('#modal-body-value').value;
            updatedPost.image = document.querySelector('#modal-image-value').value;
            updatedPost.date = data.date;
            updatedPost.likes = data.likes;
            updatedPost.comments = data.comments;
            fetch(url + idToEdit, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updatedPost),
            })
                .then((res) => res.json())
                .then(() => {
                    renderPosts(url);
                    document.getElementById('myModal').style.display = 'none';
                });
        });
});
//Create - insert new post
// method: post

addPostForm.addEventListener("submit", (e) => {
    e.preventDefault();
    fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            title: titleValue.value, // id from input html
            body: bodyValue.value,
            image: imageValue.value,
            date: new Date().toJSON().slice(0, 10).replace(/-/g, '-'),
            likes: 0,
            comments: null
        }),
    })
        .then((res) => res.json())
        .then((data) => {
            const dataArr = [];
            dataArr.push(data);
            renderPosts(url);
        });
    //reset input field to empty
    titleValue.value = "";
    bodyValue.value = "";
    imageValue.value = "";
});

searchValue.addEventListener('input', (event) => {
    searchText = searchValue.value;
    renderPosts(url + `?q=${searchText}`);
});