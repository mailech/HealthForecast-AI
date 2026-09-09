-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Sep 09, 2026 at 12:12 PM
-- Server version: 9.1.0
-- PHP Version: 8.3.14

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `final_healthcare`
--

-- --------------------------------------------------------

--
-- Table structure for table `audit_logs`
--

DROP TABLE IF EXISTS `audit_logs`;
CREATE TABLE IF NOT EXISTS `audit_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `action` varchar(100) NOT NULL,
  `description` text,
  `ip_address` varchar(45) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`)
) ENGINE=MyISAM AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `audit_logs`
--

INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `description`, `ip_address`, `created_at`) VALUES
(1, 1, 'LOGIN', 'User logged in', '::1', '2026-09-04 15:58:27'),
(2, 1, 'LOGIN', 'User logged in', '::1', '2026-09-04 16:00:25'),
(3, 1, 'LOGIN', 'User logged in', '::1', '2026-09-04 16:10:13'),
(4, 1, 'LOGIN', 'User logged in', '::1', '2026-09-05 07:26:28'),
(5, 1, 'LOGIN', 'User logged in', '::1', '2026-09-05 08:35:10'),
(6, 2, 'LOGIN', 'User logged in as hospital_admin', '::1', '2026-09-05 16:11:47'),
(7, 2, 'LOGIN', 'User logged in as hospital_admin', '::1', '2026-09-05 16:14:55'),
(8, 2, 'LOGIN', 'User logged in as hospital_admin', '::1', '2026-09-05 16:22:34'),
(9, 5, 'LOGIN', 'User logged in as researcher', '::1', '2026-09-07 14:01:44'),
(10, 6, 'LOGIN', 'User logged in as system_admin', '::1', '2026-09-07 14:07:42'),
(11, 2, 'LOGIN', 'User logged in as hospital_admin', '::1', '2026-09-07 14:18:05');

-- --------------------------------------------------------

--
-- Table structure for table `medical_records`
--

DROP TABLE IF EXISTS `medical_records`;
CREATE TABLE IF NOT EXISTS `medical_records` (
  `id` int NOT NULL AUTO_INCREMENT,
  `patient_id` int NOT NULL,
  `blood_pressure` varchar(20) DEFAULT NULL,
  `blood_glucose` decimal(10,2) DEFAULT NULL,
  `bmi` decimal(5,2) DEFAULT NULL,
  `heart_rate` int DEFAULT NULL,
  `lab_results` text,
  `previous_treatments` text,
  `admission_history` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `patient_id` (`patient_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `patients`
--

DROP TABLE IF EXISTS `patients`;
CREATE TABLE IF NOT EXISTS `patients` (
  `id` int NOT NULL AUTO_INCREMENT,
  `patient_id` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `age` int DEFAULT NULL,
  `gender` enum('Male','Female','Other') DEFAULT NULL,
  `contact` varchar(20) DEFAULT NULL,
  `blood_group` varchar(10) DEFAULT NULL,
  `medical_history` text,
  `existing_diseases` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `patient_id` (`patient_id`)
) ENGINE=MyISAM AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `patients`
--

INSERT INTO `patients` (`id`, `patient_id`, `name`, `age`, `gender`, `contact`, `blood_group`, `medical_history`, `existing_diseases`, `created_at`) VALUES
(1, 'P001', 'Rajesh Kumar', 62, 'Male', '9876543210', 'B+', 'Hypertension and diabetes', 'Hypertension, Diabetes', '2026-09-04 16:01:00'),
(2, 'P002', 'Rithanya', 45, 'Female', '9087654321', 'B-', 'Hypertension for 5 years, occasional headaches', 'Hypertension', '2026-09-07 14:15:21'),
(3, 'P003 ', 'Sanjana', 40, 'Female', '9123456780', 'A+', 'Type 2 diabetes and high blood pressure, previous hospitalization for chest pain', 'Diabetes, Hypertension', '2026-09-07 14:16:18'),
(4, 'P004', 'Bala', 20, 'Male', '9078563412', 'O+', 'Asthma since childhood, currently under regular medication', 'Asthma', '2026-09-07 14:17:20');

-- --------------------------------------------------------

--
-- Table structure for table `predictions`
--

DROP TABLE IF EXISTS `predictions`;
CREATE TABLE IF NOT EXISTS `predictions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `patient_id` int NOT NULL,
  `prediction_type` enum('risk','readmission') NOT NULL,
  `risk_level` enum('Low','Medium','High') NOT NULL,
  `risk_score` decimal(5,2) DEFAULT NULL,
  `contributing_factors` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `patient_id` (`patient_id`)
) ENGINE=MyISAM AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `predictions`
--

INSERT INTO `predictions` (`id`, `patient_id`, `prediction_type`, `risk_level`, `risk_score`, `contributing_factors`, `created_at`) VALUES
(1, 1, '', 'Medium', 30.00, 'Age, blood pressure, glucose, BMI, heart rate and previous hospitalization', '2026-09-05 07:46:36');

-- --------------------------------------------------------

--
-- Table structure for table `treatments`
--

DROP TABLE IF EXISTS `treatments`;
CREATE TABLE IF NOT EXISTS `treatments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `patient_id` int NOT NULL,
  `doctor_id` int NOT NULL,
  `diagnosis` text,
  `treatment_plan` text,
  `medication` varchar(255) DEFAULT NULL,
  `dosage` varchar(100) DEFAULT NULL,
  `status` enum('Ongoing','Completed','Cancelled') DEFAULT 'Ongoing',
  `doctor_notes` text,
  `follow_up_date` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `patient_id` (`patient_id`),
  KEY `doctor_id` (`doctor_id`)
) ENGINE=MyISAM AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `treatments`
--

INSERT INTO `treatments` (`id`, `patient_id`, `doctor_id`, `diagnosis`, `treatment_plan`, `medication`, `dosage`, `status`, `doctor_notes`, `follow_up_date`, `created_at`) VALUES
(1, 1, 1, 'Type 2 Diabetes', 'Diabetes Management', 'Metorim', '500mg', 'Ongoing', '\nRegular glucose monitoring and follow-up.', '2026-09-02', '2026-09-05 07:57:24');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('doctor','hospital_admin','researcher','system_admin') NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=MyISAM AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `created_at`) VALUES
(1, 'Dr. Rajesh Kumar', 'doctor@gmail.com', '$2b$10$Gju8kuyMaDqRIvS3ExZVb.MavWFTgHYrS0L1zPL0Ky6mYuM7fPHJO', 'doctor', '2026-09-04 15:57:51'),
(2, 'Hospital Admin', 'admin@gmail.com', '$2b$10$Q3ek57e0cB1RjOKM4gRMMexGTc1RQvzn3Ga7PHbHoq9xAJmR20oTu', 'hospital_admin', '2026-09-05 08:17:07'),
(3, 'Manimegalai V', 'mani@gmail.com', '$2b$10$UJJJ43Bu/lR.uneFGDohVOGA3bk8BUPkoOMAfkjCt7IdqdJFOLy1m', 'doctor', '2026-09-05 16:25:59'),
(4, 'Banupriya', 'banu@gmail.com', '$2b$10$hEfnAS3/nDac3fbFBysTIuMetfSDaY5Hkc.U11ft4Fx.hZ50o8KS6', 'doctor', '2026-09-05 16:28:28'),
(5, 'Researcher User', 'researcher@gmail.com', '$2b$10$LUE6fMkrd/hFVLae89GHB.jUqb3kStEV7tHRJTRVr2A0bUfr9BY6q', 'researcher', '2026-09-07 13:57:39'),
(6, 'System Administrator', 'systemadmin@gmail.com', '$2b$10$3Jisd4SuHptIpdPA/WWg.eyHl7GYa1Wd.N7T.XsrHCakCGmqyk21G', 'system_admin', '2026-09-07 14:06:23'),
(7, 'Jon', 'jon@gmail.com', '$2b$10$bCSU3TYx7mcBTYpWxp.SA.68s8cuNQ/ZfHdg4KP9UqtE1Kpku607G', 'doctor', '2026-09-07 14:13:44');
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
