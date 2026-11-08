/*
 * Bookshelf catalog
 * B02 keeps catalog data separate from the page so titles can be added
 * without changing the HTML structure.
 */

const BOOKS_DATA_URL = "../assets/data/books.json";
const VALID_STATUSES = new Set([
    "Want to Read",
    "Currently Reading",
    "Completed",
    "Paused"
]);

const catalogState = {
    books: [],
    query: "",
    category: "",
    sort: "title-asc",
    loadError: false
};

const elements = {
    grid: document.getElementById("book-grid"),
    empty: document.getElementById("catalog-empty"),
    emptyTitle: document.getElementById("catalog-empty-title"),
    emptyMessage: document.getElementById("catalog-empty-message"),
    emptyIndex: document.getElementById("catalog-empty-index"),
    status: document.getElementById("catalog-status"),
    search: document.getElementById("book-search"),
    clearSearch: document.getElementById("clear-search"),
    sort: document.getElementById("book-sort"),
    categoryButtons: document.querySelectorAll(".category-filter-button"),
    subjectCards: document.querySelectorAll(".subject-card"),
    detailsDialog: document.getElementById("book-details-dialog"),
    detailsClose: document.getElementById("book-details-close"),
    detailsContent: document.getElementById("book-details-content"),
    readingEmpty: document.querySelector(".empty-state-reading"),
    readingList: document.getElementById("currently-reading-list")
};

function hasRequiredFields(book) {
    return book
        && typeof book.id === "string"
        && book.id.trim()
        && typeof book.title === "string"
        && book.title.trim()
        && typeof book.author === "string"
        && book.author.trim()
        && typeof book.category === "string"
        && book.category.trim();
}

function normalizeBook(book) {
    return {
        id: book.id.trim(),
        title: book.title.trim(),
        author: book.author.trim(),
        category: book.category.trim(),
        tags: Array.isArray(book.tags)
            ? book.tags.filter((tag) => typeof tag === "string").map((tag) => tag.trim()).filter(Boolean)
            : [],
        cover: typeof book.cover === "string" ? book.cover.trim() : "",
        status: VALID_STATUSES.has(book.status) ? book.status : "Want to Read",
        progress: Number.isFinite(book.progress) ? Math.min(100, Math.max(0, book.progress)) : null,
        description: typeof book.description === "string" ? book.description.trim() : "",
        subtitle: typeof book.subtitle === "string" ? book.subtitle.trim() : "",
        publicationYear: typeof book.publicationYear === "string" ? book.publicationYear.trim() : "",
        publisher: typeof book.publisher === "string" ? book.publisher.trim() : "",
        isbn: typeof book.isbn === "string" ? book.isbn.trim() : "",
        language: typeof book.language === "string" ? book.language.trim() : "",
        notes: typeof book.notes === "string" ? book.notes.trim() : "",
        startedAt: typeof book.startedAt === "string" ? book.startedAt : "",
        completedAt: typeof book.completedAt === "string" ? book.completedAt : "",
        addedAt: typeof book.addedAt === "string" ? book.addedAt : ""
    };
}

function isSafeCoverSource(source) {
    if (!source || /^(javascript|data|blob):/i.test(source) || source.startsWith("//")) return false;

    try {
        const url = new URL(source, document.baseURI);
        return url.protocol === "https:" || (url.origin === window.location.origin && url.protocol === window.location.protocol);
    } catch {
        return false;
    }
}

function validateBooks(data) {
    if (!Array.isArray(data)) {
        throw new Error("Book data must be an array.");
    }

    return data.filter(hasRequiredFields).map(normalizeBook);
}

function createElement(tagName, className, text) {
    const element = document.createElement(tagName);

    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;

    return element;
}

function createFallbackCover(book) {
    const fallback = createElement("div", "book-cover book-cover-fallback");
    fallback.setAttribute("aria-label", `Cover placeholder for ${book.title}`);

    const mark = createElement("span", "book-cover-mark", "BOOK");
    const initial = createElement("span", "book-cover-initial", book.title.charAt(0).toUpperCase());
    fallback.append(mark, initial);

    return fallback;
}

function createCover(book) {
    if (!isSafeCoverSource(book.cover)) return createFallbackCover(book);

    const image = createElement("img", "book-cover");
    image.src = book.cover;
    image.alt = `Cover of ${book.title}`;
    image.addEventListener("error", () => {
        image.replaceWith(createFallbackCover(book));
    }, { once: true });

    return image;
}

function createBookCard(book) {
    const card = createElement("article", "book-card");
    card.dataset.bookId = book.id;

    const visual = createElement("div", "book-card-visual");
    visual.append(createCover(book));

    const content = createElement("div", "book-card-content");
    const category = createElement("p", "book-card-category", book.category);
    const title = createElement("h3", "book-card-title", book.title);
    const author = createElement("p", "book-card-author", `by ${book.author}`);
    const status = createElement("span", `book-status status-${book.status.toLowerCase().replaceAll(" ", "-")}`, book.status);
    const detailsButton = createElement("button", "book-details-button", "View details");
    detailsButton.type = "button";
    detailsButton.setAttribute("aria-haspopup", "dialog");
    detailsButton.addEventListener("click", () => openBookDetails(book, detailsButton));

    content.append(category, title, author, status, detailsButton);

    if (book.description) {
        content.append(createElement("p", "book-card-description", book.description));
    }

    if (book.progress !== null && book.status === "Currently Reading") {
        content.append(createElement("p", "book-card-progress", `${book.progress}% read`));
    }

    card.append(visual, content);
    return card;
}

function appendDetailField(container, label, value) {
    if (!value) return;

    const field = createElement("div", "book-detail-field");
    field.append(createElement("dt", "", label), createElement("dd", "", value));
    container.append(field);
}

function openBookDetails(book, trigger) {
    if (!elements.detailsDialog) return;

    elements.detailsContent.replaceChildren();
    elements.detailsContent.append(createCover(book));

    const copy = createElement("div", "book-details-copy");
    copy.append(createElement("p", "books-kicker", book.category));
    const detailTitle = createElement("h2", "", book.title);
    detailTitle.id = "book-details-title";
    copy.append(detailTitle);
    if (book.subtitle) copy.append(createElement("p", "book-details-subtitle", book.subtitle));
    copy.append(createElement("p", "book-details-author", `by ${book.author}`));

    const status = createElement("p", "book-details-status", book.status);
    copy.append(status);

    if (book.progress !== null) copy.append(createElement("p", "book-details-progress", `${book.progress}% read`));
    if (book.description) copy.append(createElement("p", "book-details-description", book.description));

    const metadata = createElement("dl", "book-details-metadata");
    appendDetailField(metadata, "Publication year", book.publicationYear);
    appendDetailField(metadata, "Publisher", book.publisher);
    appendDetailField(metadata, "ISBN", book.isbn);
    appendDetailField(metadata, "Language", book.language);
    appendDetailField(metadata, "Added", book.addedAt);
    appendDetailField(metadata, "Started", book.startedAt);
    appendDetailField(metadata, "Completed", book.completedAt);
    copy.append(metadata);

    if (book.notes) {
        const notes = createElement("div", "book-details-notes");
        notes.append(createElement("h3", "", "Published notes"), createElement("p", "", book.notes));
        copy.append(notes);
    }

    elements.detailsContent.append(copy);
    elements.detailsDialog._lastTrigger = trigger;
    elements.detailsDialog.showModal();
    elements.detailsClose.focus();
}

function closeBookDetails() {
    if (!elements.detailsDialog?.open) return;
    const trigger = elements.detailsDialog._lastTrigger;
    elements.detailsDialog.close();
    if (trigger) trigger.focus();
}

function matchesQuery(book, query) {
    if (!query) return true;

    const searchableText = [book.title, book.author, book.category, ...book.tags]
        .join(" ")
        .toLocaleLowerCase();

    return searchableText.includes(query);
}

function compareText(first, second) {
    return first.localeCompare(second, undefined, { sensitivity: "base" });
}

function sortBooks(books) {
    return books
        .map((book, index) => ({ book, index }))
        .sort((first, second) => {
            let result = 0;

            if (catalogState.sort === "title-desc") {
                result = compareText(second.book.title, first.book.title);
            } else if (catalogState.sort === "author-asc") {
                result = compareText(first.book.author, second.book.author);
            } else if (catalogState.sort === "recent") {
                result = (Date.parse(second.book.addedAt) || 0) - (Date.parse(first.book.addedAt) || 0);
            } else {
                result = compareText(first.book.title, second.book.title);
            }

            return result || first.index - second.index;
        })
        .map(({ book }) => book);
}

function getVisibleBooks() {
    const query = catalogState.query.trim().toLocaleLowerCase();
    const filtered = catalogState.books.filter((book) => {
        const categoryMatches = !catalogState.category || book.category === catalogState.category;
        return categoryMatches && matchesQuery(book, query);
    });

    return sortBooks(filtered);
}

function setEmptyState(title, message, index) {
    elements.empty.hidden = false;
    elements.emptyTitle.textContent = title;
    elements.emptyMessage.textContent = message;
    elements.emptyIndex.textContent = index;
}

function renderCurrentlyReading() {
    if (!elements.readingList || !elements.readingEmpty) return;

    const readingBooks = catalogState.books.filter((book) => book.status === "Currently Reading");
    elements.readingList.replaceChildren(...readingBooks.map(createBookCard));
    elements.readingList.hidden = readingBooks.length === 0;
    elements.readingEmpty.hidden = readingBooks.length > 0;
}

function renderCatalog() {
    const visibleBooks = getVisibleBooks();
    elements.grid.replaceChildren(...visibleBooks.map(createBookCard));
    elements.grid.hidden = visibleBooks.length === 0;
    renderCurrentlyReading();

    if (catalogState.loadError) {
        setEmptyState(
            "The catalog could not be loaded.",
            "Please try again later. The catalog data is currently unavailable.",
            "CATALOG / ERROR"
        );
    } else if (catalogState.books.length === 0) {
        setEmptyState(
            "The collection is being assembled.",
            "No book entries have been added yet. This shelf will become a searchable catalog when the reading data is ready.",
            "CATALOG / 00 ITEMS"
        );
    } else if (visibleBooks.length === 0) {
        setEmptyState(
            "No books match these filters.",
            "Try clearing the search or selecting All Books to see the full collection.",
            "CATALOG / NO MATCHES"
        );
    } else {
        elements.empty.hidden = true;
    }

    const categoryLabel = catalogState.category || "All Books";
    elements.status.textContent = catalogState.loadError
        ? "Catalog unavailable."
        : `${visibleBooks.length} ${visibleBooks.length === 1 ? "book" : "books"} shown · ${categoryLabel}`;
}

function setCategory(category) {
    catalogState.category = category;

    elements.categoryButtons.forEach((button) => {
        const isActive = button.dataset.category === category;
        button.classList.toggle("is-active", isActive);
        button.setAttribute("aria-pressed", String(isActive));
    });

    elements.subjectCards.forEach((card) => {
        const isActive = card.dataset.category === category;
        card.classList.toggle("is-active", isActive);
        card.setAttribute("aria-pressed", String(isActive));
    });

    renderCatalog();
}

function bindControls() {
    elements.search.addEventListener("input", (event) => {
        catalogState.query = event.target.value;
        elements.clearSearch.hidden = !catalogState.query;
        renderCatalog();
    });

    elements.clearSearch.addEventListener("click", () => {
        elements.search.value = "";
        catalogState.query = "";
        elements.clearSearch.hidden = true;
        elements.search.focus();
        renderCatalog();
    });

    elements.sort.addEventListener("change", (event) => {
        catalogState.sort = event.target.value;
        renderCatalog();
    });

    elements.categoryButtons.forEach((button) => {
        button.addEventListener("click", () => {
            setCategory(button.dataset.category);
            document.getElementById("collection").scrollIntoView({ behavior: "smooth", block: "start" });
        });
    });

    elements.subjectCards.forEach((card) => {
        card.setAttribute("aria-pressed", "false");
        card.addEventListener("click", () => {
            setCategory(card.dataset.category);
            document.getElementById("collection").scrollIntoView({ behavior: "smooth", block: "start" });
        });
    });

    if (elements.detailsClose) elements.detailsClose.addEventListener("click", closeBookDetails);
    if (elements.detailsDialog) {
        elements.detailsDialog.addEventListener("cancel", (event) => {
            event.preventDefault();
            closeBookDetails();
        });
    }
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && elements.detailsDialog?.open) {
            closeBookDetails();
        }
    });
}

async function loadBooks() {
    try {
        const response = await fetch(BOOKS_DATA_URL);

        if (!response.ok) {
            throw new Error(`Book data request failed with ${response.status}.`);
        }

        catalogState.books = validateBooks(await response.json());
    } catch (error) {
        catalogState.loadError = true;
        console.warn("Bookshelf catalog could not be loaded.", error);
    }

    renderCatalog();
}

if (elements.grid && elements.search) {
    bindControls();
    loadBooks();
}
