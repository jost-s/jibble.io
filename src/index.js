/**
 * File to implement the required functionality:
 * Once the page has finished loading its DOM elements, the API is queried
 * via an Ajax request and the results are displayed in a list.
 * Further there are functions to delete an item from the list and update
 * a post's title.
 */

// import the css files
import "./reset.css";
import "./style.css";

/**
 * Create a span element from the data text and add the corresponding css class,
 * post id and onclick action
 * @param text the element's text
 * @param id the element's id
 * @param style CSS class to add to the element
 * @param action onclick action for the element
*/
function createSpan(text, id, style, action) {
    var span = document.createElement("span");
    span.className = style;


    if (id !== null) {
        span.id = id;
    }

    if (action) {
        span.onclick = action;
    }

    span.appendChild(document.createTextNode(text));
    return span;
}

/**
 * fired when post is modified and displays an update button next to it
 */
function postChanged() {
    if (this.nextSibling.className !== "update") {
        const upd = document.createElement("span");
        upd.appendChild(document.createTextNode("update"));
        upd.className = "update";
        upd.onclick = updItem;
        this.parentElement.insertBefore(upd, this.nextSibling);
    }
}

/**
 * update the post title and remove the update button when update successful
 */
function updItem() {
    // remove onclick event to prevent multiple events
    this.onclick = null;
    // show update status
    this.innerHTML = "updating...";

    // update post title and show confirmation upon completion
    const updBtn = this;
    const itemToUpd = updBtn.previousSibling;
    const updReq = fetch(url + "posts/" + itemToUpd.id, {
        method: "PATCH",
        body: JSON.stringify(
            {
                title: itemToUpd.value
            }),
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        }
    })
    .then(function(response) {
        return response.json();
    })
    .then(function(data) {
        // if update successful remove update button and show confirmation,
        // which will disappear after 3 seconds
        if (data.title === itemToUpd.value) {
            itemToUpd.parentElement.removeChild(itemToUpd.nextSibling);
            const tmpUpdSuc = itemToUpd.parentElement.insertBefore(createSpan("updated!", null, "updsuccess"), itemToUpd.nextSibling);
            setTimeout(function() {
                tmpUpdSuc.parentElement.removeChild(tmpUpdSuc);
                }, 3000);
        }
    })
    .catch(function(error) {
      console.log("Fetch Error: ", error);
      itemToUpd
    });
}

/**
 * delete the clicked item's post and remove the list item
 * from the DOM and the collection
 */
function delItem() {
    // remove onclick event to prevent multiple events
    this.onclick = null;
    // show delete status
    this.innerHTML = "deleting...";

    // delete post item from the API and upon successful execution
    // of command from the DOM
    const itemToDel = this;
    const delReq = fetch(url + "posts/" + this.id, {
        method: "DELETE"
    }).then(function(response) {
        document.getElementById("results").removeChild(itemToDel.parentElement);
    }).catch(function(error) {
        console.log("Fetch error: ", error);
        itemToDel.innerHTML = "delete";
    });
}

const url = "https://jsonplaceholder.typicode.com/";

/**
 * After HTML has loaded, query data and display it
 */
document.addEventListener("DOMContentLoaded", function(event) {
    // send 3 fetch GET requests to retrieve users, albums and posts data from the API;
    // the response will be a promise of JSON data

    const usersReq = fetch(url + "users/").then(function(response) {
        return response.json();
    });

    const albumsReq = fetch(url + "albums/").then(function(response) {
        return response.json();
    });

    const postsReq = fetch(url + "posts/").then(function(response) {
        return response.json();
    });

    // process the data once (and only if) all three promises have been resolved
    // i.e. data from all three queries has been retrieved

    Promise.all([usersReq, albumsReq, postsReq]).then(function(values) {
        const users = values[0];
        const albums = values[1];
        const posts = values[2];

        // after resolving the promises delete text "Loading..." from page
        document.getElementById("results").removeChild(document.getElementById("results").firstChild);

        // create the data collection with randomized data items
        for (var i = 0; i < 30; i++) {
            var tmpUser = users[Math.floor(Math.random() * users.length)];
            var tmpAlbum = albums[Math.floor(Math.random() * albums.length)];
            var tmpPost = posts[Math.floor(Math.random() * posts.length)];

            // create a new DOM list item and append it to the results list
            var listItem = document.createElement("li");
            listItem.id = i;
            
            var input = document.createElement("input");
            input.className = "post";
            input.id = tmpPost.id;
            input.value = tmpPost.title;
            input.oninput = postChanged;
            listItem.appendChild(input);

            listItem.appendChild(createSpan(tmpAlbum.title, "album" + tmpAlbum.id, "album"));
            listItem.appendChild(createSpan(tmpUser.name, "user" + tmpUser.id, "name"));
            listItem.appendChild(createSpan("delete", tmpPost.id, "delete", delItem));

            document.getElementById("results").appendChild(listItem);
        }
    });
});