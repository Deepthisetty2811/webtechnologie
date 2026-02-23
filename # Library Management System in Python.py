# Library Management System in Python

class Book:
    def __init__(self, title, author, isbn):
        self.title = title
        self.author = author
        self.isbn = isbn
        self.available = True

    def __str__(self):
        status = "Available" if self.available else "Not Available"
        return f"{self.title} by {self.author} | ISBN: {self.isbn} | {status}"


class Library:
    def __init__(self, name):
        self.name = name
        self.books = []

    def add_book(self, title, author, isbn):
        book = Book(title, author, isbn)
        self.books.append(book)
        print(f"\n✅ '{title}' has been added to the library.")

    def display_books(self):
        if not self.books:
            print("\n📚 No books in the library.")
            return
        print(f"\n📚 Books in {self.name}:")
        for book in self.books:
            print(book)

    def borrow_book(self, isbn):
        for book in self.books:
            if book.isbn == isbn:
                if book.available:
                    book.available = False
                    print(f"\n📕 You borrowed '{book.title}'.")
                    return
                else:
                    print(f"\n⚠️ '{book.title}' is already borrowed.")
                    return
        print("\n❌ Book not found.")

    def return_book(self, isbn):
        for book in self.books:
            if book.isbn == isbn:
                if not book.available:
                    book.available = True
                    print(f"\n📗 You returned '{book.title}'.")
                    return
                else:
                    print(f"\n⚠️ '{book.title}' was not borrowed.")
                    return
        print("\n❌ Book not found.")


def main():
    library = Library("City Library")

    while True:
        print("\n======= Library Menu =======")
        print("1. Add Book")
        print("2. Display Books")
        print("3. Borrow Book")
        print("4. Return Book")
        print("5. Exit")

        choice = input("\nEnter your choice (1-5): ")

        if choice == '1':
            title = input("Enter book title: ")
            author = input("Enter author name: ")
            isbn = input("Enter ISBN: ")
            library.add_book(title, author, isbn)

        elif choice == '2':
            library.display_books()

        elif choice == '3':
            isbn = input("Enter ISBN of book to borrow: ")
            library.borrow_book(isbn)

        elif choice == '4':
            isbn = input("Enter ISBN of book to return: ")
            library.return_book(isbn)

        elif choice == '5':
            print("\n👋 Exiting the system. Goodbye!")
            break

        else:
            print("\n❌ Invalid choice. Please try again.")


if __name__ == "__main__":
    main()
