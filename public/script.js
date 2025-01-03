document.addEventListener('DOMContentLoaded', () => {
    function fetchBooksJSON(callback) {
        fetch('/data/books')
            .then(response => response.json())
            .then(data => callback(data))
            .catch(err => console.log('Ошибка загрузки данных: ', err));
    }

    class Node {
        constructor(book) {
            this.book = book;
            this.height = 1;
            this.left = null;
            this.right = null;
            this.position = 0;
            this.balance = 0;
        }
    }

    class AVLTree {
        constructor() {
            this.root = null;
            this.currentPosition = 0;
        }

        height(node) {
            if (node) {
                return node.height;
            } else {
                return 0;
        }
}

        updateHeightAndBalance(node) {
            if (node) {
                node.height = Math.max(this.height(node.left), this.height(node.right)) + 1;
                node.balance = this.height(node.left) - this.height(node.right);
            }
        }

        rightRotate(y) {
            const x = y.left;
            const T2 = x.right;

            x.right = y;
            y.left = T2;

            this.updateHeightAndBalance(y);
            this.updateHeightAndBalance(x);

            return x;
        }

        leftRotate(x) {
            const y = x.right;
            const T2 = y.left;

            y.left = x;
            x.right = T2;

            this.updateHeightAndBalance(x);
            this.updateHeightAndBalance(y);

            return y;
        }

        insert(root, book) {
            if (!root) {
                const newNode = new Node(book);
                newNode.position = ++this.currentPosition;
                return newNode;
            }

            if (book.name < root.book.name) {
                root.left = this.insert(root.left, book);
            } else if (book.name > root.book.name) {
                root.right = this.insert(root.right, book);
            } else {
                return root;
            }

            this.updateHeightAndBalance(root);

            const balance = root.balance;

            if (balance > 1 && book.name < root.left.book.name) {
                return this.rightRotate(root);
            }

            if (balance < -1 && book.name > root.right.book.name) {
                return this.leftRotate(root);
            }

            if (balance > 1 && book.name > root.left.book.name) {
                root.left = this.leftRotate(root.left);
                return this.rightRotate(root);
            }

            if (balance < -1 && book.name < root.right.book.name) {
                root.right = this.rightRotate(root.right);
                return this.leftRotate(root);
            }

            return root;
        }

        insertBook(book) {
            this.root = this.insert(this.root, book);
        }

        inOrder(root, callback) {
            if (root) {
                this.inOrder(root.left, callback);
                callback(root.book, root.position, root.balance);
                this.inOrder(root.right, callback);
            }
        }

        getBooks() {
            let books = [];
            this.inOrder(this.root, (book, position, balance) => books.push({ ...book, position, balance }));
            return books;
        }

        visualize(root, x, y, dx, dy, container) {
            if (!root) return;

            const nodeElement = document.createElement('div');
            nodeElement.classList.add('tree-node');
            nodeElement.style.left = `${x}px`;
            nodeElement.style.top = `${y}px`;

            const img = document.createElement('img');
            img.src = root.book.image;
            img.alt = root.book.name;
            nodeElement.appendChild(img);

            const label = document.createElement('div');
            label.classList.add('label');
            label.textContent = `${root.book.name}\n${root.book.author}`;
            nodeElement.appendChild(label);

            const details = document.createElement('div');
            details.classList.add('details');
            details.innerHTML = `Позиция: ${root.position}<br>Баланс: ${root.balance}`;
            nodeElement.appendChild(details);

            container.appendChild(nodeElement);

            if (root.left) {
                this.drawEdge(container, x, y, x - dx, y + dy);
                this.visualize(root.left, x - dx, y + dy, dx / 1.5, dy, container);
            }
            if (root.right) {
                this.drawEdge(container, x, y, x + dx, y + dy);
                this.visualize(root.right, x + dx, y + dy, dx / 1.5, dy, container);
            }
        }

        drawEdge(container, x1, y1, x2, y2) {
            const line = document.createElement('div');
            line.classList.add('tree-line');

            const length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
            const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);

            line.style.width = `${length}px`;
            line.style.transform = `rotate(${angle}deg)`;
            line.style.left = `${x1}px`;
            line.style.top = `${y1}px`;

            container.appendChild(line);
        }
    }

    const bookTree = new AVLTree();

    function displayBooks(books) {
        const bookList = document.querySelector('.book-list');
        bookList.innerHTML = '';

        books.forEach(book => {
            const bookItem = document.createElement('div');
            bookItem.classList.add('book-item');
            bookItem.innerHTML = `
                <img src="${book.image}" alt="${book.name}" class="book-image">
                <div class="book-info">
                    <h4>${book.name}</h4>
                    <p>${book.author}</p>
                    <p>Позиция в АВЛ-дереве: ${book.position}</p>
                    <p>Баланс в дереве: ${book.balance}</p>
                    <a href="${book.link}" class="btn btn-success" target="_blank">Скачать</a>
                </div>
            `;
            bookList.appendChild(bookItem);
        });
    }

    const genreSelect = document.getElementById('genreSelect');
    const searchInput = document.getElementById('searchInput');
    const authorSearchInput = document.getElementById('authorSearchInput');

    function filterBooks() {
        const genre = genreSelect.value;
        const searchQuery = searchInput.value.toLowerCase();
        const authorQuery = authorSearchInput.value.toLowerCase();
        let filteredBooks = bookTree.getBooks();

        if (genre) {
            filteredBooks = filteredBooks.filter(book => book.genre === genre);
        }

        if (searchQuery) {
            filteredBooks = filteredBooks.filter(book => book.name.toLowerCase().includes(searchQuery));
        }

        if (authorQuery) {
            filteredBooks = filteredBooks.filter(book => book.author.toLowerCase().includes(authorQuery));
        }

        displayBooks(filteredBooks);
    }

    genreSelect.addEventListener('change', filterBooks);
    searchInput.addEventListener('input', filterBooks);
    authorSearchInput.addEventListener('input', filterBooks);

    fetchBooksJSON((booksData) => {
        booksData.forEach(book => bookTree.insertBook(book));
        displayBooks(bookTree.getBooks());

        const visualizationContainer = document.getElementById('avl-tree-visualization');
        visualizationContainer.innerHTML = '';
        const initialDx = 800; 
        const initialDy = 1000;
        bookTree.visualize(bookTree.root, (window.innerWidth / 2) + 1400, 20, initialDx, initialDy, visualizationContainer);
        
        let isDragging = false;
        let startX, startY;
        const dragSensitivity = 1; // Регулирует чувствительность к перетаскиванию
        let currentScale = 0.75; // Начальный масштаб

        visualizationContainer.addEventListener('mousedown', (e) => {
            isDragging = true;
            startX = e.pageX - visualizationContainer.offsetLeft;
            startY = e.pageY - visualizationContainer.offsetTop;
            visualizationContainer.style.cursor = 'grabbing';
        });

        visualizationContainer.addEventListener('mouseup', () => {
            isDragging = false;
            visualizationContainer.style.cursor = 'grab';
        });

        visualizationContainer.addEventListener('mouseleave', () => {
            isDragging = false;
            visualizationContainer.style.cursor = 'grab';
        });

        visualizationContainer.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            e.preventDefault();
            
            const x = e.pageX - visualizationContainer.offsetLeft;
            const y = e.pageY - visualizationContainer.offsetTop;
            
            const dx = (x - startX) * dragSensitivity;
            const dy = (y - startY) * dragSensitivity;
            
            visualizationContainer.scrollLeft -= dx;
            visualizationContainer.scrollTop -= dy;
            
            startX = x;
            startY = y;
        });

        visualizationContainer.addEventListener('wheel', (e) => {
            e.preventDefault();
            const delta = -e.deltaY || e.wheelDelta || -e.detail;
            const scaleAmount = 0.1;
            
            if (delta > 0) {
                currentScale = Math.min(currentScale + scaleAmount, 2); // Увеличение
            } else {
                currentScale = Math.max(currentScale - scaleAmount, 0.5); // Уменьшение
            }

            visualizationContainer.style.transform = `scale(${currentScale})`;
            visualizationContainer.style.transformOrigin = 'top left';
        });
    });

    const navItems = document.querySelectorAll('nav li');
    const pages = document.querySelectorAll('.page');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const pageName = item.getAttribute('data-page');

            pages.forEach(page => {
                page.classList.remove('active');
            });
            document.getElementById(`${pageName}-page`).classList.add('active');

            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
        });
    });
});

function navigateToAuthors() {
    const pages = document.querySelectorAll('.page');
    const navItems = document.querySelectorAll('nav li');

    pages.forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById('authors-page').classList.add('active');

    navItems.forEach(nav => nav.classList.remove('active'));
    document.querySelector('li[data-page="authors"]').classList.add('active');
}
