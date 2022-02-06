const INCOMPLETED_LIST_BOOK_ID = "incompleteBookshelfList";
const COMPLETED_LIST_BOOK_ID = "completeBookshelfList";
const BOOK_ITEMID = "itemId";

function createUndoButton() {
    return createButton("green", "Belum selesai di Baca", function(event){
        undoTaskFromCompleted(event.target.parentElement.parentElement);
    })
}

function createTrashButton() {
    return createButton("red", "Hapus buku", function(event){
        removeTaskCompleted(event.target.parentElement.parentElement);
    })
}

function createCheckButton() {
    return createButton("green", "Selesai dibaca", function(event){
        addTaskCompleted(event.target.parentElement.parentElement);
    })
}

function createEditButton() {
    return createButton("red", "Edit Buku", function (event) {
        editBook(event.target.parentElement.parentElement);
    })
}

function createButton(buttonTypeClass, textButton, eventListener) {
    const button = document.createElement("button");
    button.innerText = textButton,
    button.classList.add(buttonTypeClass);
    button.addEventListener("click", function (event) {
        eventListener(event);
    });
    return button;
}

function addBook() {
    const uncompletedBookList = document.getElementById(INCOMPLETED_LIST_BOOK_ID);
    const completedBookList = document.getElementById(COMPLETED_LIST_BOOK_ID);
    const textTitle = document.getElementById("inputBookTitle").value;
    const textAuthor = document.getElementById("inputBookAuthor").value;
    const textBookYear = document.getElementById("inputBookYear").value;
    const bookIsCompleted = document.getElementById("inputBookIsComplete").checked;

    const book = makeBook(textTitle, textAuthor, textBookYear, bookIsCompleted);
    const bookObject = composeBookObject(textTitle, textAuthor, textBookYear, bookIsCompleted);

    book[BOOK_ITEMID] = bookObject.id;
    books.push(bookObject);

    if (bookIsCompleted) {
        completedBookList.append(book);
    } else {
        uncompletedBookList.append(book);        
    }
    updateDataToStorage();
}

function makeBook(title, author, year, isCompleted) {
    const textTitle = document.createElement("h3");
    textTitle.innerText = title;

    const textAuthor = document.createElement("p");
    textAuthor.innerText = author;

    const textYear = document.createElement("p");
    textYear.innerText = year;


    const container = document.createElement("div");
    container.classList.add("action");
    if(isCompleted){
        container.append(
            createUndoButton(),
            createEditButton(),
            createTrashButton()
        );
    } else {
        container.append(
            createCheckButton(),
            createEditButton(),
            createTrashButton()
        );
    }

    const textArticle = document.createElement("article");
    textArticle.classList.add("book_item");
    textArticle.append(textTitle, textAuthor, textYear, container);

    return textArticle;

}

function addTaskCompleted(taskElement) {
    const listCompleted = document.getElementById(COMPLETED_LIST_BOOK_ID);
    console.log(taskElement);
    const taskTitle = taskElement.querySelector(".book_item > h3").innerText;
    const taskAuthor = taskElement.querySelector(".book_item > p").innerText;
    const taskYear = taskElement.querySelector(".book_item > p").innerText;
    
    const newBook = makeBook(taskTitle, taskAuthor, taskYear, true);
    const book = findBook(taskElement[BOOK_ITEMID]);
    book.isCompleted = true;
    newBook[BOOK_ITEMID] = book.id;

    listCompleted.append(newBook);
    taskElement.remove();

    updateDataToStorage();
}

function removeTaskCompleted(taskElement) {
    let statusAlert = confirm('Apa kamu yakin ingin menghapus?');

    if (!statusAlert) return;
    
    const bookPosition = findBookIndex(taskElement[BOOK_ITEMID]);
    books.splice(bookPosition, 1);

    taskElement.remove();
    updateDataToStorage();
}

function undoTaskFromCompleted(taskElement) {
    const bookUncompleted = document.getElementById(INCOMPLETED_LIST_BOOK_ID);
    const taskTitle = taskElement.querySelector(".book_item > h3").innerText;
    const taskAuthor = taskElement.querySelector(".book_item > p").innerText;
    const taskYear = taskElement.querySelector(".book_item > p").innerText;

    const newBook = makeBook(taskTitle, taskAuthor, taskYear, false);
    console.log(findBook(taskElement[BOOK_ITEMID]));
    console.log(taskElement[BOOK_ITEMID]);
    const book = findBook(taskElement[BOOK_ITEMID]);
    book.isCompleted = false;
    newBook[BOOK_ITEMID] = book.id;

    bookUncompleted.append(newBook);
    taskElement.remove();

    updateDataToStorage();
}

function refreshDataFromTodos() {
    const listUncompleted = document.getElementById(INCOMPLETED_LIST_BOOK_ID);
    let listCompleted = document.getElementById(COMPLETED_LIST_BOOK_ID);

    listUncompleted.innerHTML = '';
    listCompleted.innerHTML = '';

    for(book of books) {
        const newBook = makeBook(book.title, book.author, book.year, book.isCompleted);
        newBook[BOOK_ITEMID] = book.id;

        if(book.isCompleted) {
            listCompleted.append(newBook);
        } else {
            listUncompleted.append(newBook);
        }
    }
}

function searchBook() {
    const searchBookTitle = document.getElementById("searchBookTitle");
    const filter = searchBookTitle.value.toUpperCase();
    const card = document.querySelectorAll(".book_item");
    console.log(card);

    for (let i=0; i<card.length; i++) {
        const bookTitle = card[i].getElementsByTagName("h3")[0];
        const textTitle = bookTitle.innerText;

        if (textTitle.toUpperCase().indexOf(filter) > -1) {
            card[i].style.display = "";
        } else {
            card[i].style.display = "none"
        }
    }

}

function editBook(bookElement) {
    const sectionEdit = document.getElementById("edit_section");
    sectionEdit.style.display = "block";

    const book = findBook(bookElement[BOOK_ITEMID]);
    
    const editBookTitle = document.getElementById("inputBookTitleEdit");
    const editBookAuthor = document.getElementById("inputBookAuthorEdit");
    const editBookYear = document.getElementById("inputBookYearEdit");
    const editBookIsCompleted = document.getElementById("inputBookIsCompleteEdit");

    editBookTitle.value = book.title;
    editBookAuthor.value = book.author;
    editBookYear.value = book.year;
    editBookIsCompleted.checked = book.isCompleted;

    const saveEdit = document.querySelector(".submitEdit");

    saveEdit.addEventListener('click', function (event) {
        event.preventDefault();
        updateEditBook(editBookTitle.value, editBookAuthor.value, editBookYear.value, editBookIsCompleted.checked, book.id);
        sectionEdit.style.display = "none";
    })

    const cancelEdit = document.querySelector(".cancelEdit");

    cancelEdit.addEventListener('click', function (event) {
        event.preventDefault();
        sectionEdit.style.display = "none";
    })
}

function updateEditBook(title, author, year, isCompleted, id) {

    const bookIndex = findBookIndex(id);
    books[bookIndex] = {
        id: id,
        title: title,
        author: author,
        year: year,
        isCompleted: isCompleted
    };

    refreshDataFromTodos();
    updateDataToStorage();
}