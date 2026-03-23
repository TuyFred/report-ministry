-- phpMyAdmin SQL Dump
-- version 5.0.2
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 02, 2026 at 07:56 AM
-- Server version: 10.4.14-MariaDB
-- PHP Version: 7.4.10

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `report`
--
-- Note: Stored procedures (sp_get_system_stats, sp_get_user_reports_stats) removed.
-- They required SUPER privilege (DEFINER) and referenced non-existent columns.
-- Analytics are handled by the application layer.

-- --------------------------------------------------------

--
-- Table structure for table `attachments`
--

CREATE TABLE `attachments` (
  `id` int(11) NOT NULL,
  `report_id` int(11) NOT NULL,
  `filename` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `url` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `mime_type` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `size` int(11) DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `reports`
--

CREATE TABLE `reports` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `date` date NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `country` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `church` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `evangelism_hours` float DEFAULT 0,
  `people_reached` int(11) DEFAULT 0,
  `contacts_received` int(11) DEFAULT 0,
  `bible_study_sessions` int(11) DEFAULT 0,
  `bible_study_attendants` int(11) DEFAULT 0,
  `unique_attendants` int(11) DEFAULT 0,
  `newcomers` int(11) DEFAULT 0,
  `meditation_time` float DEFAULT 0,
  `prayer_time` float DEFAULT 0,
  `morning_service` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `regular_service` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sermons_listened` int(11) DEFAULT 0,
  `articles_written` int(11) DEFAULT 0,
  `exercise_time` float DEFAULT 0,
  `sermon_reflection` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reflections` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `thanksgiving` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `repentance` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `prayer_requests` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `other_work` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tomorrow_tasks` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `other_activities` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `fullname` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('admin','leader','member') COLLATE utf8mb4_unicode_ci DEFAULT 'member',
  `country` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `contact` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `profile_image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `resetPasswordToken` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `resetPasswordExpire` datetime DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `fullname`, `email`, `password`, `role`, `country`, `contact`, `address`, `profile_image`, `resetPasswordToken`, `resetPasswordExpire`, `createdAt`, `updatedAt`) VALUES
(1, 'System Administrator', 'admin@ministry.com', '$2b$10$8K1p/a0dL22N/y/xnnTNwO7B2vHY1aXHkPvPsFG0PRE7.A4XHLPiu', 'admin', 'Default Country', '+1234567890', 'Admin Address', NULL, NULL, NULL, '2026-02-03 15:18:19', '2026-02-03 15:18:19'),
(2, 'Fred Tuyishime', 'fred@gmail.com', '$2b$10$az/3O.pTfbAFRVx3c74sXevnkuctZ02wtxgN0JCUlu8yD/fKc00AO', 'member', 'Rwanda', '0787879364', 'Kicukiro Kigali Rwanda', NULL, NULL, NULL, '2026-02-28 11:21:05', '2026-02-28 11:21:05'),
(3, 'System Administrator', 'admin@system.com', '$2b$10$a/EeTV4ai2.hTrFCZiyBHOdxLSnbmH59942UKgbntXy0vMfKI8OhC', 'admin', 'Global', '0000000000', 'System Admin', 'uploads/1772303392113-profile.png', NULL, NULL, '2026-02-28 18:13:18', '2026-02-28 18:29:52');

-- --------------------------------------------------------
--
-- Table structure for table `ReportFormTemplate`
--
CREATE TABLE IF NOT EXISTS `ReportFormTemplate` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `definition` json NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 0,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Stand-in structure for view `vw_latest_reports`
-- (See below for the actual view)
--
CREATE TABLE `vw_latest_reports` (
`id` int(11)
,`user_id` int(11)
,`fullname` varchar(255)
,`email` varchar(255)
,`role` enum('admin','leader','member')
,`date` date
,`name` varchar(255)
,`country` varchar(255)
,`church` varchar(255)
,`evangelism_hours` float
,`people_reached` int(11)
,`contacts_received` int(11)
,`bible_study_sessions` int(11)
,`bible_study_attendants` int(11)
,`unique_attendants` int(11)
,`newcomers` int(11)
,`meditation_time` float
,`prayer_time` float
,`sermons_listened` int(11)
,`articles_written` int(11)
,`exercise_time` float
,`createdAt` timestamp
,`updatedAt` timestamp
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `vw_user_statistics`
-- (See below for the actual view)
--
CREATE TABLE `vw_user_statistics` (
`id` int(11)
,`fullname` varchar(255)
,`email` varchar(255)
,`role` enum('admin','leader','member')
,`total_reports` bigint(21)
,`total_evangelism_hours` double
,`total_people_reached` decimal(32,0)
,`total_prayer_time` double
,`total_meditation_time` double
,`total_newcomers` decimal(32,0)
,`avg_evangelism_hours` double
,`last_report_date` date
);

-- --------------------------------------------------------

--
-- Structure for view `vw_latest_reports`
--
DROP TABLE IF EXISTS `vw_latest_reports`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vw_latest_reports`  AS  select `r`.`id` AS `id`,`r`.`user_id` AS `user_id`,`u`.`fullname` AS `fullname`,`u`.`email` AS `email`,`u`.`role` AS `role`,`r`.`date` AS `date`,`r`.`name` AS `name`,`r`.`country` AS `country`,`r`.`church` AS `church`,`r`.`evangelism_hours` AS `evangelism_hours`,`r`.`people_reached` AS `people_reached`,`r`.`contacts_received` AS `contacts_received`,`r`.`bible_study_sessions` AS `bible_study_sessions`,`r`.`bible_study_attendants` AS `bible_study_attendants`,`r`.`unique_attendants` AS `unique_attendants`,`r`.`newcomers` AS `newcomers`,`r`.`meditation_time` AS `meditation_time`,`r`.`prayer_time` AS `prayer_time`,`r`.`sermons_listened` AS `sermons_listened`,`r`.`articles_written` AS `articles_written`,`r`.`exercise_time` AS `exercise_time`,`r`.`createdAt` AS `createdAt`,`r`.`updatedAt` AS `updatedAt` from (`reports` `r` join `users` `u` on(`r`.`user_id` = `u`.`id`)) order by `r`.`date` desc,`r`.`createdAt` desc ;

-- --------------------------------------------------------

--
-- Structure for view `vw_user_statistics`
--
DROP TABLE IF EXISTS `vw_user_statistics`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vw_user_statistics`  AS  select `u`.`id` AS `id`,`u`.`fullname` AS `fullname`,`u`.`email` AS `email`,`u`.`role` AS `role`,count(`r`.`id`) AS `total_reports`,coalesce(sum(`r`.`evangelism_hours`),0) AS `total_evangelism_hours`,coalesce(sum(`r`.`people_reached`),0) AS `total_people_reached`,coalesce(sum(`r`.`prayer_time`),0) AS `total_prayer_time`,coalesce(sum(`r`.`meditation_time`),0) AS `total_meditation_time`,coalesce(sum(`r`.`newcomers`),0) AS `total_newcomers`,coalesce(avg(`r`.`evangelism_hours`),0) AS `avg_evangelism_hours`,max(`r`.`date`) AS `last_report_date` from (`users` `u` left join `reports` `r` on(`u`.`id` = `r`.`user_id`)) group by `u`.`id`,`u`.`fullname`,`u`.`email`,`u`.`role` ;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `attachments`
--
ALTER TABLE `attachments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_attachments_report` (`report_id`);

--
-- Indexes for table `reports`
--
ALTER TABLE `reports`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_reports_user_date` (`user_id`,`date`),
  ADD KEY `idx_reports_date` (`date`),
  ADD KEY `idx_reports_user_id` (`user_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `email_2` (`email`),
  ADD KEY `idx_users_email` (`email`),
  ADD KEY `idx_users_role` (`role`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `attachments`
--
ALTER TABLE `attachments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `reports`
--
ALTER TABLE `reports`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `attachments`
--
ALTER TABLE `attachments`
  ADD CONSTRAINT `attachments_ibfk_1` FOREIGN KEY (`report_id`) REFERENCES `reports` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `reports`
--
ALTER TABLE `reports`
  ADD CONSTRAINT `reports_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
