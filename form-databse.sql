Create database form_database;
use form_database;
Create table form_data (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    surname VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

insert into form_data (name, surname, email, message) values
('Ruben', 'ten Cate', 'ruben.ten-cate@example.com', 'Hello, this is a test message.'),
('Arthur', 'Saugy', 'arthur.saugy@example.com', 'Hi there! This is another test message.');

