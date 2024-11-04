-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Tempo de geração: 04/11/2024 às 17:34
-- Versão do servidor: 10.4.32-MariaDB
-- Versão do PHP: 8.1.25

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Banco de dados: `game`
--

-- --------------------------------------------------------

--
-- Estrutura para tabela `personagens`
--

CREATE TABLE `personagens` (
  `id` int(11) NOT NULL,
  `nome` varchar(50) NOT NULL,
  `raridade` enum('Incomum','Raro','Mítico','Épico','Lendário','Super Lendário') NOT NULL,
  `vida` int(11) DEFAULT 100,
  `ataque` int(11) DEFAULT 10,
  `defesa` int(11) DEFAULT 5,
  `velocidade` int(11) DEFAULT 10
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Despejando dados para a tabela `personagens`
--

INSERT INTO `personagens` (`id`, `nome`, `raridade`, `vida`, `ataque`, `defesa`, `velocidade`) VALUES
(1, 'Guerreiro Incomum', 'Incomum', 120, 1, 8, 10),
(2, 'Arqueiro Raro', 'Raro', 150, 2, 10, 12),
(3, 'Mago Mítico', 'Mítico', 160, 25, 7, 15),
(4, 'Paladino Épico', 'Épico', 180, 30, 15, 10),
(5, 'Dragão Lendário', 'Lendário', 250, 35, 20, 8),
(6, 'Fênix Super Lendária', 'Super Lendário', 300, 40, 25, 10);

-- --------------------------------------------------------

--
-- Estrutura para tabela `players`
--

CREATE TABLE `players` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `pos_x` int(11) DEFAULT 0,
  `pos_y` int(11) DEFAULT 0,
  `health` int(11) DEFAULT 100,
  `level` int(11) DEFAULT 1,
  `experience` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `saldo` int(11) DEFAULT 0,
  `incomum` int(11) DEFAULT 0,
  `raro` int(11) DEFAULT 0,
  `mitico` int(11) DEFAULT 0,
  `epico` int(11) DEFAULT 0,
  `lendario` int(11) DEFAULT 0,
  `super_lendario` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Despejando dados para a tabela `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `saldo`, `incomum`, `raro`, `mitico`, `epico`, `lendario`, `super_lendario`) VALUES
(1, 'joaoluiz093', '$2y$10$wmDfJZHsFrvMDj3zSZKICOciTSknbnP6VtFoDjuHqfLqJjtvTGY1e', 0, 1, 0, 0, 0, 0, 0),
(2, 'joaoluiz0933', '$2y$10$/l7y1r2QVbupdVBsW8TxKOeQVKMb9z24SPF6jx1DzQ7wL9tWxOMBO', 0, 0, 0, 0, 0, 0, 0),
(3, '0123', '$2y$10$TzAfVkR4nS9YCXpC5sJvl.G2APKEKMZvVjlaPU9fDx4m.prVdO1xK', 0, 1, 1, 1, 0, 0, 0);

--
-- Índices para tabelas despejadas
--

--
-- Índices de tabela `personagens`
--
ALTER TABLE `personagens`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `players`
--
ALTER TABLE `players`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT para tabelas despejadas
--

--
-- AUTO_INCREMENT de tabela `personagens`
--
ALTER TABLE `personagens`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de tabela `players`
--
ALTER TABLE `players`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
