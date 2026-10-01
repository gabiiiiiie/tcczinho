create database IF NOT EXISTS almoxarifado;

CREATE TABLE estoque (
	Id INT PRIMARY KEY,
    Nome VARCHAR(100),
    Quantidade INT,
    Estoque INT,
    Descricao VARCHAR(255),
	Preco INT,
    Categoria VARCHAR(50),
    Foto TEXT
);

Insert into estoque (Id, Nome, Quantidade, Estoque, Descricao, Preco, Categoria, Foto) VALUES
('1', 'Teclado Mecânico', 15, 5, 'Teclado com fio USB', 70, 'Elétrica', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT-aidvEp1LNqovukNUgoGQyAasv3eAmhkVmRNIKhZOQg&s=10'),
('2', 'Monitor', 20, 5, 'Monitor DELL', 200 , 'Elétrica', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR4o5vXJipEo3j0Ra006a9xaGm4CX0OXmBWCKmKrb-U1g&s=10'),
('3', 'Cabo USB', 22, 5, 'Cabo USB tipo A', 200 , 'Elétrica', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRzpqbaUeP_m_dsQbAd3LPWZwGT8GBNlZHrzDGCTY-kIw&s=10'),
('4', 'Caneta', 120, 5, 'Caneta bic', 2 , 'Geral', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTwuCuOgH09-MzcNV4bEkYSDUuh2l_7g6y3yqOu84mLGA&s=10'),
('5', 'Mouse', 30, 5, 'Mouse sem fio', 40 , 'Elétrica', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRSlPn7_84TMx1fT3E0JJxyDiOtSDF_vGOuyyYVJQJzFw&s=10'),
('6', 'Cadeira', 16, 5, 'Cadeira de escritorio', 1000 , 'Geral', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSjnZZbBggIaBaj4oN79a2DE90AM7Kql9_x5jyV3B8_MQ&s=10');



CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') NOT NULL DEFAULT 'user'
);


INSERT INTO usuarios (username, password, role)
VALUES ('admin', 'scrypt:32768:8:1$cqggDDvEcPHxEdOf$6c150efad1bc7b29d19cfa94ff0b68a46bfb31e86de0ccd74dad1710b8cf3249b3e8bb9ad347df27fa9c9f496946029133aa3d1fb243b86bb73e8d7125341bb6', 'admin');






