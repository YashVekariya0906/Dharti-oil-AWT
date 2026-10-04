-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 02, 2026 at 05:59 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `dharti_oil`
--

-- --------------------------------------------------------

--
-- Table structure for table `about_us`
--

CREATE TABLE `about_us` (
  `id` int(11) NOT NULL,
  `company_intro` longtext DEFAULT NULL,
  `about_banner_image` varchar(500) DEFAULT NULL,
  `about_intro_image` varchar(500) DEFAULT NULL,
  `infra_title` varchar(255) DEFAULT 'Infrastructure',
  `infra_description` longtext DEFAULT NULL,
  `infra_image_1` varchar(500) DEFAULT NULL,
  `infra_image_2` varchar(500) DEFAULT NULL,
  `infra_image_3` varchar(500) DEFAULT NULL,
  `infra_image_4` varchar(500) DEFAULT NULL,
  `infra_image_5` varchar(500) DEFAULT NULL,
  `infra_image_6` varchar(500) DEFAULT NULL,
  `mgmt_title` varchar(255) DEFAULT 'Management Behind Dharti Amrut',
  `faq_data` longtext DEFAULT '[]'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `about_us`
--

INSERT INTO `about_us` (`id`, `company_intro`, `about_banner_image`, `about_intro_image`, `infra_title`, `infra_description`, `infra_image_1`, `infra_image_2`, `infra_image_3`, `infra_image_4`, `infra_image_5`, `infra_image_6`, `mgmt_title`, `faq_data`) VALUES
(1, 'Dharti Industries, also known as Dharti Mini Oil Mill, has been a trusted name in the groundnut oil industry for the past 8 years. Established with a strong commitment to purity and transparency, the company has earned a special place in the hearts of its customers.\r\n\r\nThe journey began at New 150 Feet Ring Road, near Korat Chowk, Pardi, under the guidance of Mrs. Nimuben Korat and Mr. Dilipbhai Korat, who started the mill on a small scale with a clear vision – to provide pure and unadulterated groundnut oil to people.\r\n\r\nIn a market flooded with oils often mixed with impurities, leading to health issues, Dharti Industries took a stand to offer completely pure oil. With this purpose, Mr. Dilipbhai Korat established a full-fledged oil production unit on his own farmland, focusing not just on profit but on delivering healthy and high-quality food to society.\r\n\r\nWhat started with a single oil extraction machine has now grown into a well-expanded setup with multiple machines operating simultaneously. Despite the growth, the company continues to maintain its core value of transparency by extracting oil in front of customers, ensuring complete trust and satisfaction.', 'http://localhost:5000/uploads/about/about_about_banner_image_1777655394213.png', 'http://localhost:5000/uploads/about/about_about_intro_image_1777656557087.png', 'Infrastructure', 'Dharti Industries has developed a well-equipped oil production facility in Rajkot, Gujarat, designed to deliver quality and efficiency. The unit is continuously expanding to meet the growing demand of customers.\r\n\r\nThe company strictly uses G-20 quality groundnuts, known for their superior taste and oil quality. These groundnuts are carefully selected to ensure they are completely dry and free from moisture, which helps in maintaining the quality and shelf life of the oil.\r\n\r\nThe production process is carried out with utmost care, and customers are given the option to witness the oil extraction process live from their own groundnuts. This ensures complete transparency and builds strong trust among customers.\r\n\r\nToday, Dharti Industries operates multiple machines and serves a loyal customer base. Many customers purchase their yearly oil requirement in bulk, reflecting their confidence in the consistent quality and quantity maintained by the company.\r\n\r\nTo enhance customer convenience, the company offers:\r\n\r\nEasy order booking via call or message\r\nFree home delivery service\r\nConsistent quality with no compromise', 'http://localhost:5000/uploads/about/about_infra_image_1_1775583186201.jpg', 'http://localhost:5000/uploads/about/about_infra_image_2_1777658323611.png', 'http://localhost:5000/uploads/about/about_infra_image_3_1777657286380.jpeg', 'http://localhost:5000/uploads/about/about_infra_image_4_1777658136898.jpeg', 'http://localhost:5000/uploads/about/about_infra_image_5_1777658136905.jpeg', 'http://localhost:5000/uploads/about/about_infra_image_6_1777658103096.jpeg', 'Management Behind Dharti Amrut', '\"[{\\\"question\\\":\\\"Why G20?\\\",\\\"answer\\\":\\\"G20 Provide the good and pure quality oil\\\"}]\"');

-- --------------------------------------------------------

--
-- Table structure for table `about_us_members`
--

CREATE TABLE `about_us_members` (
  `id` int(11) NOT NULL,
  `name` varchar(150) NOT NULL,
  `designation` varchar(200) NOT NULL,
  `bio` longtext DEFAULT NULL,
  `member_image` varchar(500) DEFAULT NULL,
  `sort_order` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `about_us_members`
--

INSERT INTO `about_us_members` (`id`, `name`, `designation`, `bio`, `member_image`, `sort_order`) VALUES
(1, 'Dilip Korat', 'Owner', 'Hello i am Dilip Korat Owner of dharati amrut', 'http://localhost:5000/uploads/about/about_member_image_1776916332756.png', 0),
(2, 'Dishit Korat', 'Co Founder ', 'Hello I am Dishit Korat Co founder of dharati amrut', 'http://localhost:5000/uploads/about/about_member_image_1776912721352.png', 1);

-- --------------------------------------------------------

--
-- Table structure for table `blog_details`
--

CREATE TABLE `blog_details` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `content` longtext NOT NULL,
  `banner_image` varchar(255) DEFAULT NULL,
  `author` varchar(100) NOT NULL DEFAULT 'Dharti Oil Team',
  `status` enum('draft','published') NOT NULL DEFAULT 'published',
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `blog_details`
--

INSERT INTO `blog_details` (`id`, `title`, `slug`, `content`, `banner_image`, `author`, `status`, `created_at`, `updated_at`) VALUES
(1, 'Dharati Amrut Groundnut Oil: Pure Taste, Trusted Quality', 'dharti-amrut-groundnut-oil', 'Dharati Amrut Groundnut Oil: Pure Taste, Trusted Quality\r\n\r\nWhen it comes to cooking oil, every household wants something that is pure, healthy, and reliable. At Dharati Amrut, we bring you premium quality G20 groundnut oil that combines traditional goodness with modern quality standards.\r\n\r\nWhether you are cooking daily meals or preparing special dishes, choosing the right oil makes all the difference.\r\n\r\n🥜 Why Choose Groundnut Oil for Daily Cooking?\r\n\r\nGroundnut oil has been a part of Indian kitchens for generations. Its natural properties make it one of the most trusted oils for cooking.\r\n\r\nWith Dharati Amrut Groundnut Oil, you get:\r\n\r\nRich natural taste and aroma\r\nHigh smoke point for safe cooking\r\nIdeal for Indian dishes like frying, sautéing, and tadka\r\nLight texture that doesn\'t feel greasy\r\n\r\nIt is perfect for both home kitchens and commercial use.\r\n\r\n💡 What Makes Dharati Amrut Special?\r\n\r\nAt Dharati Amrut, we focus on quality, purity, and consistency. Our G20 groundnut oil is carefully processed to maintain its natural goodness while ensuring safe and long-lasting use.\r\n\r\n✔ Made from high-quality groundnuts\r\n✔ Clean and hygienic processing\r\n✔ Balanced taste suitable for all recipes\r\n✔ Designed for everyday cooking needs\r\n\r\nWe believe in delivering oil that you can trust for your family.\r\n\r\n🛢️ Available Packaging Options\r\n\r\nWe understand that every household and business has different needs. That\'s why Dharati Amrut offers multiple packaging sizes:\r\n\r\n🔸 15 KG Tin Oil\r\n\r\nPerfect for:\r\n\r\nRestaurants\r\nBulk users\r\nCommercial kitchens\r\n\r\nProvides long-lasting supply and better value.\r\n\r\n🔸 15 KG Can Oil\r\n\r\nIdeal for:\r\n\r\nLarge families\r\nCatering services\r\n\r\nEasy to store and handle for regular use.\r\n\r\n🔸 5 KG Can Oil\r\n\r\nBest for:\r\n\r\nMedium-sized families\r\nMonthly household use\r\n\r\nA balance between quantity and convenience.\r\n\r\n🔸 1 Litre Oil\r\n\r\nSuitable for:\r\n\r\nSmall families\r\nTrial use\r\n\r\nCompact, easy to use, and perfect for daily cooking.\r\n\r\n🔥 Suitable for Every Cooking Style\r\n\r\nDharati Amrut Groundnut Oil is versatile and works well for:\r\n\r\nDeep frying (snacks, bhajiya, puri)\r\nDaily cooking (sabji, dal, roti)\r\nTadka and seasoning\r\nCommercial food preparation\r\n\r\nIts stability at high temperatures makes it a reliable choice.\r\n\r\n🛒 Smart Buying Tips\r\n\r\nBefore purchasing any cooking oil, always check:\r\n\r\nPackaging quality and seal\r\nManufacturing and expiry date\r\nBrand trust and consistency\r\nStorage conditions\r\n\r\nWith Dharati Amrut, you can be assured of freshness and quality in every pack.\r\n\r\n✅ Final Thoughts\r\n\r\nChoosing the right cooking oil is not just about price — it\'s about health, taste, and trust.\r\n\r\nDharati Amrut Groundnut Oil (G20) is designed to meet the needs of:\r\n\r\nEveryday households\r\nBulk buyers\r\nFood businesses\r\n\r\nWhether you choose 1 litre or 15 kg, you are choosing quality you can rely on.', 'http://localhost:5000/uploads/blog/blog_dharatiamrutgroundnutoilpuretastetrustedquality_1777654460704.png', 'Dharti Oil Team', 'published', '2026-03-23 12:40:50', '2026-03-23 12:40:50');

-- --------------------------------------------------------

--
-- Table structure for table `brokers`
--

CREATE TABLE `brokers` (
  `broker_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `mobile_no` varchar(20) NOT NULL,
  `email` varchar(255) NOT NULL,
  `address` text NOT NULL,
  `pincode` varchar(10) NOT NULL,
  `password` varchar(255) NOT NULL,
  `commission_percent` decimal(5,2) NOT NULL DEFAULT 0.00,
  `status` enum('Active','Inactive') NOT NULL DEFAULT 'Active',
  `role` varchar(50) NOT NULL DEFAULT 'broker',
  `otp_code` varchar(10) DEFAULT NULL,
  `otp_expiry` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `contact_details`
--

CREATE TABLE `contact_details` (
  `id` int(11) NOT NULL,
  `address` text DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `mobile` varchar(255) DEFAULT NULL,
  `facebook_link` varchar(255) DEFAULT NULL,
  `instagram_link` varchar(255) DEFAULT NULL,
  `youtube_link` varchar(255) DEFAULT NULL,
  `banner_image` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `contact_details`
--

INSERT INTO `contact_details` (`id`, `address`, `email`, `mobile`, `facebook_link`, `instagram_link`, `youtube_link`, `banner_image`, `created_at`, `updated_at`) VALUES
(1, '150, 2nd Ring Rd, Vavdi, PARDI, Rajkot, Gujarat 360022', 'mayur.khandla122265@marwadiuniversity.ac.in', '+919316161597', '', 'https://www.instagram.com/dharti_amrut_oil?igsh=MW9taDU0N3VnZThhaQ==', '', 'http://localhost:5000/uploads/contact/contact_banner_1777653727958.png', '2026-03-23 14:03:46', '2026-05-01 16:42:07');

-- --------------------------------------------------------

--
-- Table structure for table `contact_inquiries`
--

CREATE TABLE `contact_inquiries` (
  `id` int(11) NOT NULL,
  `first_name` varchar(255) NOT NULL,
  `last_name` varchar(255) NOT NULL,
  `phone` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `message` text DEFAULT NULL,
  `user_id` int(11) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `contact_inquiries`
--

INSERT INTO `contact_inquiries` (`id`, `first_name`, `last_name`, `phone`, `email`, `message`, `user_id`, `created_at`, `updated_at`) VALUES
(1, 'Mayur', 'Khandla', '9316161597', 'khandlamayur62@gmail.com', 'I want to Some 5 kg Oil can and and 1 litre oil bottal  ', 10, '2026-03-23 14:07:34', '2026-03-23 14:07:34'),
(2, 'yash', 'vekariya', '701693032', 'yash.vekariya120891@marwadiuniversity.ac.in', 'hii', 21, '2026-03-31 05:59:44', '2026-03-31 05:59:44'),
(3, 'Yash', 'Patel', '9990999088', 'yp013433@gmail.com', 'hy oli is very bad', 22, '2026-04-01 12:41:33', '2026-04-01 12:41:33');

-- --------------------------------------------------------

--
-- Table structure for table `delivery_charge`
--

CREATE TABLE `delivery_charge` (
  `id` int(11) NOT NULL,
  `charge_360001` decimal(10,2) NOT NULL DEFAULT 0.00,
  `charge_360002` decimal(10,2) NOT NULL DEFAULT 0.00,
  `charge_360003` decimal(10,2) NOT NULL DEFAULT 0.00,
  `charge_360004` decimal(10,2) NOT NULL DEFAULT 0.00,
  `upi_id` varchar(255) DEFAULT '',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `delivery_charge`
--

INSERT INTO `delivery_charge` (`id`, `charge_360001`, `charge_360002`, `charge_360003`, `charge_360004`, `upi_id`, `createdAt`, `updatedAt`) VALUES
(1, 100.00, 200.00, 150.00, 190.00, 'khandlamayur62@okaxis', '2026-04-04 10:15:18', '2026-04-04 10:15:51');

-- --------------------------------------------------------

--
-- Table structure for table `footer_settings`
--

CREATE TABLE `footer_settings` (
  `id` int(11) NOT NULL,
  `company_name` varchar(255) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `facebook_link` varchar(255) DEFAULT NULL,
  `instagram_link` varchar(255) DEFAULT NULL,
  `home_link` varchar(255) DEFAULT NULL,
  `shop_link` varchar(255) DEFAULT NULL,
  `about_link` varchar(255) DEFAULT NULL,
  `contact_link` varchar(255) DEFAULT NULL,
  `blog_link` varchar(255) DEFAULT NULL,
  `privacy_policy_link` varchar(255) DEFAULT NULL,
  `return_exchange_link` varchar(255) DEFAULT NULL,
  `working_days` varchar(255) DEFAULT NULL,
  `working_hours` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `footer_settings`
--

INSERT INTO `footer_settings` (`id`, `company_name`, `address`, `phone`, `email`, `facebook_link`, `instagram_link`, `home_link`, `shop_link`, `about_link`, `contact_link`, `blog_link`, `privacy_policy_link`, `return_exchange_link`, `working_days`, `working_hours`) VALUES
(1, 'Dharati Oil', 'S.NO. 85P2, NEAR SIDDHESHWAR SOCIETY, OPP. UNIQUE SCHOOL,OPP. KALPVAN,\nKORAT CHOWK, GONDAL NATIONAL HIGHWAY, PARDI, RAJKOT - 360024', '9824631331', 'dhartiamrut1212@gmail.com', 'https://m.youtube.com/watch?fbclid=PAb21jcARiUUpleHRuA2FlbQIxMQBzcnRjBmFwcF9pZA81NjcwNjczNDMzNTI0MjcAAack3AmmLcS5t_nrlDGhhjWe00ZFbMWnOmSE2tx6qKJ9MS0CjgdQB1TuGp_qeA_aem_U44r1D1Ud5pnrQwpB5MbhA&v=jQpfeTxv1AI&feature=youtu.be', 'https://www.instagram.com/dharti_amrut_oil?igsh=MW9taDU0N3VnZThhaQ==', 'Home', 'Shop', 'About Us', 'Contact Us', 'Blog', 'Privacy Policy', 'Return and Exchange', 'Monday-Tuesday & Thursday-Sunday', '8:00AM - 7:00PM');

-- --------------------------------------------------------

--
-- Table structure for table `global_prices`
--

CREATE TABLE `global_prices` (
  `id` int(11) NOT NULL,
  `current_price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `global_prices`
--

INSERT INTO `global_prices` (`id`, `current_price`, `created_at`, `updated_at`) VALUES
(1, 2000.00, '2026-03-24 13:27:32', '2026-04-01 12:43:12');

-- --------------------------------------------------------

--
-- Table structure for table `navbar`
--

CREATE TABLE `navbar` (
  `nav_id` int(11) NOT NULL,
  `nav_logo_path` varchar(255) DEFAULT NULL,
  `I1_path` varchar(255) DEFAULT NULL,
  `I2_path` varchar(255) DEFAULT NULL,
  `I3_path` varchar(255) DEFAULT NULL,
  `I4_path` varchar(255) DEFAULT NULL,
  `I5_path` varchar(255) DEFAULT NULL,
  `intro_path` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `navbar`
--

INSERT INTO `navbar` (`nav_id`, `nav_logo_path`, `I1_path`, `I2_path`, `I3_path`, `I4_path`, `I5_path`, `intro_path`) VALUES
(2, 'http://localhost:5000/uploads/navbar/nav_logo_path_1774078598350.jpeg', 'http://localhost:5000/uploads/navbar/I1_path_1774078598354.png', 'http://localhost:5000/uploads/navbar/I2_path_1774078598430.png', 'http://localhost:5000/uploads/navbar/I3_path_1774089886294.png', 'http://localhost:5000/uploads/navbar/I4_path_1777692386085.png', NULL, 'http://localhost:5000/uploads/navbar/intro_path_1777692327231.png');

-- --------------------------------------------------------

--
-- Table structure for table `oil_cake_price`
--

CREATE TABLE `oil_cake_price` (
  `id` int(11) NOT NULL,
  `price_per_kg` decimal(10,2) NOT NULL DEFAULT 0.00,
  `min_quantity_kg` decimal(10,2) NOT NULL DEFAULT 20.00,
  `is_available` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `oil_cake_price`
--

INSERT INTO `oil_cake_price` (`id`, `price_per_kg`, `min_quantity_kg`, `is_available`, `created_at`, `updated_at`) VALUES
(1, 15.00, 20.00, 1, '2026-04-11 06:53:21', '2026-04-11 06:54:07');

-- --------------------------------------------------------

--
-- Table structure for table `oil_cake_requests`
--

CREATE TABLE `oil_cake_requests` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `quantity_kg` decimal(10,2) NOT NULL,
  `price_per_kg` decimal(10,2) NOT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `delivery_address` text DEFAULT NULL,
  `contact_number` varchar(15) NOT NULL,
  `notes` text DEFAULT NULL,
  `status` enum('Pending','Confirmed','Processing','Delivered','Cancelled','Rejected') NOT NULL DEFAULT 'Pending',
  `admin_note` text DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `oil_cake_requests`
--

INSERT INTO `oil_cake_requests` (`id`, `user_id`, `quantity_kg`, `price_per_kg`, `total_amount`, `delivery_address`, `contact_number`, `notes`, `status`, `admin_note`, `created_at`, `updated_at`) VALUES
(1, 22, 21.00, 15.00, 315.00, NULL, '6355990290', 'no', '', 'yes', '2026-04-11 06:54:31', '2026-04-22 18:56:28'),
(2, 22, 21.00, 15.00, 315.00, NULL, '6355990290', 'heii', 'Confirmed', 'Come ', '2026-04-11 06:56:01', '2026-04-11 06:56:48'),
(3, 22, 23.00, 15.00, 345.00, NULL, '6355990290', NULL, '', 'yes', '2026-04-22 18:25:05', '2026-04-22 18:56:00'),
(4, 22, 234.00, 15.00, 3510.00, NULL, '6355990290', NULL, '', 'yes', '2026-04-22 18:40:18', '2026-04-22 18:55:55'),
(5, 22, 41.00, 15.00, 615.00, NULL, '6355990290', NULL, 'Confirmed', 'yes', '2026-04-23 02:54:23', '2026-04-23 02:54:34');

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `order_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `status` enum('Pending','Processing','Shipped','Delivered','Cancelled') DEFAULT 'Pending',
  `shipping_address` text DEFAULT NULL,
  `contact_number` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `payment_method` varchar(255) DEFAULT NULL,
  `delivery_charge` decimal(10,2) DEFAULT 0.00,
  `cgst` decimal(10,2) DEFAULT 0.00,
  `sgst` decimal(10,2) DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`order_id`, `user_id`, `total_amount`, `status`, `shipping_address`, `contact_number`, `createdAt`, `updatedAt`, `payment_method`, `delivery_charge`, `cgst`, `sgst`) VALUES
(1, 22, 1500.00, 'Delivered', 'kantoliya para, nijanand society, street no.1, moviya, 360003', '6355990290', '2026-04-01 09:58:04', '2026-04-01 10:21:30', NULL, 0.00, 0.00, 0.00),
(2, 22, 2250.00, 'Shipped', 'kantoliya para, nijanand society, street no.1, moviya, 360003', '6355990290', '2026-04-01 10:26:30', '2026-04-01 10:48:39', NULL, 0.00, 0.00, 0.00),
(3, 22, 1500.00, 'Pending', 'kantoliya para, nijanand society, street no.1, moviya, 360003', '6355990290', '2026-04-01 11:25:10', '2026-04-01 11:25:10', NULL, 0.00, 0.00, 0.00),
(4, 22, 3000.00, 'Processing', 'kantoliya para, nijanand society, street no.1, moviya, 360003', '6355990290', '2026-04-01 13:06:37', '2026-04-22 19:24:33', NULL, 0.00, 0.00, 0.00),
(5, 22, 4087.50, 'Delivered', 'kantoliya para, nijanand society, street no.1, moviya, 360003', '6355990290', '2026-04-04 10:22:35', '2026-04-04 10:24:50', 'ONLINE', 150.00, 93.75, 93.75),
(6, 22, 2512.50, 'Delivered', 'kantoliya para, nijanand society, street no.1, moviya, 360003', '6355990290', '2026-04-04 10:44:40', '2026-04-04 11:18:27', 'ONLINE', 150.00, 56.25, 56.25),
(7, 22, 4875.00, 'Pending', 'kantoliya para, nijanand society, street no.1, moviya, 360003', '6355990290', '2026-04-06 03:12:15', '2026-04-23 02:02:44', 'COD', 150.00, 112.50, 112.50),
(8, 22, 4875.00, 'Delivered', 'kantoliya para, nijanand society, street no.1, moviya, 360003', '6355990290', '2026-05-01 14:19:07', '2026-05-01 14:21:09', 'COD', 150.00, 112.50, 112.50);

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `order_item_id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `price_at_purchase` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `order_items`
--

INSERT INTO `order_items` (`order_item_id`, `order_id`, `product_id`, `quantity`, `price_at_purchase`) VALUES
(1, 1, 2, 1, 1500.00),
(2, 2, 1, 1, 2250.00),
(3, 3, 2, 1, 1500.00),
(4, 4, 2, 2, 1500.00),
(5, 5, 1, 1, 2250.00),
(6, 5, 2, 1, 1500.00),
(7, 6, 1, 1, 2250.00),
(8, 7, 1, 2, 2250.00),
(9, 8, 1, 2, 2250.00);

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `product_id` int(10) NOT NULL,
  `product_name` varchar(255) NOT NULL,
  `product_quantity` int(11) DEFAULT 0,
  `product_description` text DEFAULT NULL,
  `product_price` decimal(10,2) NOT NULL,
  `product_discount` decimal(10,2) DEFAULT 0.00,
  `product_image` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`product_id`, `product_name`, `product_quantity`, `product_description`, `product_price`, `product_discount`, `product_image`) VALUES
(1, '15 Kg Tin', 22, 'For Midium Family ', 2250.00, 2500.00, 'http://localhost:5000/uploads/products/15kgtin_1774078623398.jpg'),
(2, '15 kg Can', 30, 'Help for long time', 1500.00, 1700.00, 'http://localhost:5000/uploads/products/15kgcan_1777646750716.png'),
(3, '5 Kg Can', 28, 'hello my mill name is dharati oil ', 2000.00, 1900.00, 'http://localhost:5000/uploads/products/5kgcan_1774078655914.jpg'),
(6, '1 Litre Bottle', 20, 'Use for small work ', 100.00, 89.00, 'http://localhost:5000/uploads/products/1litrebottle_1774078669187.jpg');

-- --------------------------------------------------------

--
-- Table structure for table `register`
--

CREATE TABLE `register` (
  `user_id` int(50) NOT NULL,
  `username` varchar(255) NOT NULL,
  `moblie_no` varchar(20) NOT NULL,
  `emali` varchar(255) NOT NULL,
  `address` text NOT NULL,
  `pincode` varchar(10) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(50) NOT NULL DEFAULT 'user',
  `otp_code` varchar(10) DEFAULT NULL,
  `otp_expiry` datetime DEFAULT NULL,
  `commission_percent` decimal(5,2) NOT NULL DEFAULT 0.00,
  `status` enum('Active','Inactive') NOT NULL DEFAULT 'Active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `register`
--

INSERT INTO `register` (`user_id`, `username`, `moblie_no`, `emali`, `address`, `pincode`, `password`, `role`, `otp_code`, `otp_expiry`, `commission_percent`, `status`) VALUES
(2, 'mayur', '2147483647', 'mayur@gmail.com', 'rajkot', '360001', '$2b$10$B3PU53cby80xmjRMCn2dpOCOhkahJ2Qnjv/KaibnC88r1V4WM7NLy', 'admin', NULL, NULL, 0.00, 'Active'),
(7, 'yash', '2147483647', 'yashvekariya0906@gmail.com', 'pardi', '360024', '$2b$10$n.MiKfE8dzh8EAWR5.LMkO6ztrf0AgfIOxLnPlxp.kCM2SS6b9Qga', 'user', NULL, NULL, 0.00, 'Active'),
(8, 'yash', '1234567890', 'yash@gmail.com', 'par', '360024', '$2b$10$esdUxpUX.y3E1R0BLWVh1eUwhhcFpOvD5yIQptcBcbw8xhH.5zNga', 'admin', NULL, NULL, 0.00, 'Active'),
(10, 'mayur', '9029021145', 'mayur.khandla122265@marwadiuniversity.ac.in', 'Bedi, Rajkot ', '360001', '$2b$10$2yztIpID5t81rEwv/mJii.oh09Sgwjxf3PXifbe/JRhwpppmCkQli', 'user', NULL, NULL, 0.00, 'Active'),
(18, 'Mayur Khandla', '9316161597', 'khandlamayur62@gmail.com', 'Bedi, Rajkot', '360001', '$2b$10$cAm506gfmDM4M3ve7PcwjemW2LfDX0HAZXSH8kNUaGSGnqk91hJf.', 'broker', NULL, NULL, 2.00, 'Active'),
(21, 'meet limbani', '9054101116', 'meetlimbani25@gmail.com', 'moviya', '360002', '$2b$10$Ay7klJc0sLFuqi77cVRtV.yGlSgtrpaDHhqebC3YZ9krJ0/greK/e', 'user', NULL, NULL, 0.00, 'Active'),
(22, 'bhargav limbani', '6355990290', 'limbanibhargavmaheshbhai@gmail.com', 'kantoliya para, nijanand society, street no.1, moviya', '360003', '$2b$10$NoVxKl47vUSXf0wYOTUL..7ZBWHIh9t8Df3FUrYuB5/ifpWwT6T3u', 'user', NULL, NULL, 0.00, 'Active'),
(24, 'nikhil bhanderi', '9909415640', 'nikhilbhanderi4410@gmail.com', 'bedi', '360003', '$2b$10$xnL2PeTBgzgrNwmUmJeLTO2nf8og4asXYsAyKKeCONg5YcrrOPhi6', 'broker', NULL, NULL, 3.50, 'Active'),
(29, 'yash vekariya', '7016930325', 'yp013433@gmail.com', 'bedi,rajkot', '360002', '$2b$10$4VTVt/ag0FNFMjbYDlwoAO3/IA4vl3rDOpUnCJNda/3AzkLJqlnKK', 'broker', NULL, NULL, 3.00, 'Active'),
(31, 'darshan bhanderi', '9104219230', 'dgbhanderi007@gmail.com', 'madhapar', '360003', '$2b$10$jj.4B2UseIjQp/dVjnd6DuHJcM.3pFcViwMPIJZd/pQqCgPuEPfKu', 'broker', NULL, NULL, 1.00, 'Active');

-- --------------------------------------------------------

--
-- Table structure for table `selling_requests`
--

CREATE TABLE `selling_requests` (
  `request_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `stock_per_mound` decimal(10,2) NOT NULL,
  `our_price` decimal(10,2) NOT NULL,
  `customer_price` decimal(10,2) NOT NULL,
  `broker_id` int(11) DEFAULT NULL,
  `status` enum('Pending','Accepted','Scheduled','Reached','Completed','Cancelled','AdminRejected','BrokerRejected','BrokerRejectionConfirmed') NOT NULL DEFAULT 'Pending',
  `visit_day` date DEFAULT NULL,
  `visit_time` time DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `is_visited` tinyint(1) NOT NULL DEFAULT 0,
  `delivered_quantity` decimal(10,2) DEFAULT NULL,
  `broker_comments` text DEFAULT NULL,
  `final_price` decimal(10,2) DEFAULT NULL,
  `sample_photos` text DEFAULT NULL,
  `reached_at` datetime DEFAULT NULL,
  `admin_reject_reason` varchar(255) DEFAULT NULL,
  `admin_reject_comment` text DEFAULT NULL,
  `broker_reject_reason` varchar(255) DEFAULT NULL,
  `broker_reject_comment` text DEFAULT NULL,
  `broker_reject_photos` text DEFAULT NULL,
  `payment_proof` varchar(255) DEFAULT NULL,
  `payment_method` varchar(20) DEFAULT 'Cash'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `selling_requests`
--

INSERT INTO `selling_requests` (`request_id`, `user_id`, `stock_per_mound`, `our_price`, `customer_price`, `broker_id`, `status`, `visit_day`, `visit_time`, `created_at`, `updated_at`, `is_visited`, `delivered_quantity`, `broker_comments`, `final_price`, `sample_photos`, `reached_at`, `admin_reject_reason`, `admin_reject_comment`, `broker_reject_reason`, `broker_reject_comment`, `broker_reject_photos`, `payment_proof`, `payment_method`) VALUES
(5, 10, 100.00, 2000.00, 2050.00, 18, 'Completed', '2026-03-26', '04:00:00', '2026-03-25 14:25:20', '2026-03-25 17:02:54', 1, 2.00, 'G20 Groundnut is midium', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Cash'),
(6, 10, 80.00, 2000.00, 2100.00, 18, 'Completed', '2026-03-28', '10:50:00', '2026-03-27 05:31:49', '2026-03-27 05:41:16', 1, 20.00, 'I am riched', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Cash'),
(7, 22, 50.00, 2000.00, 1900.00, 24, 'Completed', '2026-04-01', '12:32:00', '2026-03-31 06:41:45', '2026-03-31 07:02:08', 1, 50.00, 'hi', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Cash'),
(8, 10, 100.00, 2000.00, 2150.00, NULL, 'Completed', '2026-04-01', '11:20:00', '2026-04-01 04:59:33', '2026-04-11 06:48:38', 1, 100.00, 'deal final', 2100.00, '[\"http://localhost:5000/uploads/reports/report_photo_1775022594712_828.png\"]', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Cash'),
(10, 21, 23.00, 2000.00, 2100.00, NULL, 'Completed', '2026-04-01', '11:50:00', '2026-04-01 06:14:18', '2026-04-11 06:48:38', 1, 79.99, 'no', 2050.00, '[\"http://localhost:5000/uploads/reports/report_photo_1775024521203_258.png\"]', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Cash'),
(11, 22, 50.00, 2000.00, 2200.00, 24, 'Completed', '2026-04-01', '12:06:00', '2026-04-01 06:31:20', '2026-04-01 06:36:05', 1, 81.00, 'hii', 2100.00, '[]', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Cash'),
(12, 22, 32232321.00, 2000.00, 2222.00, 24, 'Completed', '2026-04-02', '18:19:00', '2026-04-01 12:43:50', '2026-04-11 06:48:38', 1, 100.00, 'rsmlled ckjymhg', 2100.00, '[\"http://localhost:5000/uploads/reports/report_photo_1775047768690_291.png\"]', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Cash'),
(13, 22, 80.00, 2000.00, 2100.00, 24, 'Completed', '2026-04-02', '21:00:00', '2026-04-01 12:59:50', '2026-04-11 06:48:38', 1, 80.00, 'DeAL DONE', 2050.00, '[\"http://localhost:5000/uploads/reports/report_photo_1775048640134_561.png\"]', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Cash'),
(14, 22, 50.00, 2000.00, 2100.00, 31, 'Completed', '2026-04-01', '19:18:00', '2026-04-01 13:44:56', '2026-04-11 06:48:38', 1, 70.00, 'done by darshan', 2050.00, '[\"http://localhost:5000/uploads/reports/report_photo_1775051222928_110.png\"]', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Cash'),
(15, 22, 20.00, 2000.00, 2100.00, 18, 'Completed', '2026-04-04', '10:00:00', '2026-04-03 13:32:52', '2026-04-11 06:48:38', 1, 19.99, 'good', 2050.00, '[\"http://localhost:5000/uploads/reports/report_photo_1775223580882_414.png\"]', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Cash'),
(16, 22, 35.00, 2000.00, 2100.00, NULL, 'AdminRejected', NULL, NULL, '2026-04-03 13:45:43', '2026-04-03 14:41:22', 0, NULL, NULL, NULL, NULL, NULL, 'High Price', 'Your price is very high', NULL, NULL, NULL, NULL, 'Cash'),
(17, 22, 50.00, 2000.00, 2050.00, 18, 'BrokerRejectionConfirmed', '2026-04-04', '09:00:00', '2026-04-03 14:41:55', '2026-04-11 06:48:38', 0, NULL, NULL, NULL, NULL, '2026-04-03 14:43:01', NULL, NULL, 'Bad Groundnut', 'Groundnut is very bad', '[\"http://localhost:5000/uploads/broker/broker_reject_photo_1775227463733_660.jpg\"]', NULL, 'Cash'),
(18, 22, 40.00, 2000.00, 2100.00, 18, 'BrokerRejectionConfirmed', '2026-04-05', '09:00:00', '2026-04-04 06:43:36', '2026-04-11 06:48:38', 0, NULL, NULL, NULL, NULL, '2026-04-04 06:47:55', NULL, NULL, 'not good', 'very bad', '[\"http://localhost:5000/uploads/broker/broker_reject_photo_1775285293157_27.jpg\"]', NULL, 'Cash'),
(19, 22, 20.00, 2000.00, 2100.00, 18, 'Reached', '2026-04-05', '09:00:00', '2026-04-04 07:22:45', '2026-04-04 07:23:46', 0, NULL, NULL, NULL, NULL, '2026-04-04 07:23:46', NULL, NULL, NULL, NULL, NULL, NULL, 'Cash'),
(20, 22, 50.00, 2000.00, 2100.00, 18, 'Completed', '2026-05-02', '09:00:00', '2026-05-01 14:23:16', '2026-05-01 14:26:02', 1, 1.00, 'Good Stoke ', 2050.00, '[]', '2026-05-01 14:24:48', NULL, NULL, NULL, NULL, NULL, NULL, 'Cash');

-- --------------------------------------------------------

--
-- Table structure for table `shop_details`
--

CREATE TABLE `shop_details` (
  `id` int(11) NOT NULL,
  `main_title` varchar(255) DEFAULT NULL,
  `main_description` text DEFAULT NULL,
  `product_highlights` text DEFAULT NULL,
  `tin15_title` varchar(255) DEFAULT NULL,
  `tin15_description` text DEFAULT NULL,
  `can15_title` varchar(255) DEFAULT NULL,
  `can15_description` text DEFAULT NULL,
  `can5_title` varchar(255) DEFAULT NULL,
  `can5_description` text DEFAULT NULL,
  `bottle1_title` varchar(255) DEFAULT NULL,
  `bottle1_description` text DEFAULT NULL,
  `quality_description` text DEFAULT NULL,
  `usage_description` text DEFAULT NULL,
  `why_choose` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `shop_details`
--

INSERT INTO `shop_details` (`id`, `main_title`, `main_description`, `product_highlights`, `tin15_title`, `tin15_description`, `can15_title`, `can15_description`, `can5_title`, `can5_description`, `bottle1_title`, `bottle1_description`, `quality_description`, `usage_description`, `why_choose`) VALUES
(1, 'Dharti G20 Groundnut Oil – Purity You Can Trust', 'At Dharti, we believe cooking oil is not just an ingredient—it’s the foundation of every healthy meal. Our G20 Groundnut Oil is made from carefully selected, high-quality groundnuts, processed with precision to retain its natural nutrients, rich aroma, and authentic taste.\n\nEvery drop of our oil reflects purity, freshness, and tradition, making it the perfect choice for households, restaurants, and food businesses that value both health and flavor.', 'What Makes G20 Groundnut Oil Special?\n\nOur G20 variety groundnuts are known for their high oil content and superior quality. The oil extracted from these seeds is:\n\nNaturally rich in Vitamin E\n\nContains healthy unsaturated fats\n\nHelps support heart health\n\nKnown for its high smoke point, making it ideal for deep frying\n\nEnhances the taste and aroma of every dish\n\nWhether you are cooking traditional Gujarati food or everyday meals, Dharti Groundnut Oil gives you consistent taste and nutrition.', '15kg Tin – Bulk Power Pack', 'Designed for restaurants, caterers, and large families.\nThis packaging ensures long-lasting freshness and is perfect for high-volume cooking needs.', '15kg Can – Easy Bulk Handling', 'A strong and convenient packaging option for heavy daily usage.\nIt is easy to store, transport, and use in commercial kitchens or large households.', '5kg Can – Smart Family Choice', 'Ideal for medium-sized families who want quality and convenience.\nKeeps oil fresh while offering enough quantity for regular cooking.', '1kg Bottle – Daily Freshness Pack', 'Perfect for small families or individual use.\nLightweight, easy to handle, and ensures freshness with every pour.', 'Quality & Processing\n\nWe follow strict quality standards to ensure you get the best:\n\nCarefully selected premium G20 groundnuts\n\nHygienic processing under controlled conditions\n\nNo harmful chemicals or adulteration\n\nSealed packaging to maintain purity\n\nConsistent quality in every batch', 'Perfect for Every Cooking Style\n\nOur groundnut oil is versatile and suitable for:\n\nDeep frying (pakoras, puri, bhajiya)\n\nEveryday cooking (sabji, dal)\n\nTraditional Gujarati dishes\n\nSnacks and fast food preparation\n\nIts natural flavor enhances food taste without overpowering it.', 'Trusted Quality\n\nFarm to Kitchen Freshness\n\nRich Taste & Aroma\n\nHealthy Cooking Choice\n\nAvailable in Multiple Convenient Sizes');

-- --------------------------------------------------------

--
-- Table structure for table `site_config`
--

CREATE TABLE `site_config` (
  `id` int(11) NOT NULL,
  `logo_text` varchar(255) NOT NULL,
  `logo_highlight` varchar(255) NOT NULL,
  `welcome_message` varchar(255) NOT NULL,
  `discover_text` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `about_us`
--
ALTER TABLE `about_us`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `about_us_members`
--
ALTER TABLE `about_us_members`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `blog_details`
--
ALTER TABLE `blog_details`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD UNIQUE KEY `slug_2` (`slug`),
  ADD UNIQUE KEY `slug_3` (`slug`),
  ADD UNIQUE KEY `slug_4` (`slug`),
  ADD UNIQUE KEY `slug_5` (`slug`),
  ADD UNIQUE KEY `slug_6` (`slug`),
  ADD UNIQUE KEY `slug_7` (`slug`),
  ADD UNIQUE KEY `slug_8` (`slug`),
  ADD UNIQUE KEY `slug_9` (`slug`),
  ADD UNIQUE KEY `slug_10` (`slug`),
  ADD UNIQUE KEY `slug_11` (`slug`),
  ADD UNIQUE KEY `slug_12` (`slug`),
  ADD UNIQUE KEY `slug_13` (`slug`),
  ADD UNIQUE KEY `slug_14` (`slug`),
  ADD UNIQUE KEY `slug_15` (`slug`),
  ADD UNIQUE KEY `slug_16` (`slug`),
  ADD UNIQUE KEY `slug_17` (`slug`),
  ADD UNIQUE KEY `slug_18` (`slug`),
  ADD UNIQUE KEY `slug_19` (`slug`),
  ADD UNIQUE KEY `slug_20` (`slug`),
  ADD UNIQUE KEY `slug_21` (`slug`),
  ADD UNIQUE KEY `slug_22` (`slug`),
  ADD UNIQUE KEY `slug_23` (`slug`),
  ADD UNIQUE KEY `slug_24` (`slug`),
  ADD UNIQUE KEY `slug_25` (`slug`),
  ADD UNIQUE KEY `slug_26` (`slug`),
  ADD UNIQUE KEY `slug_27` (`slug`),
  ADD UNIQUE KEY `slug_28` (`slug`),
  ADD UNIQUE KEY `slug_29` (`slug`),
  ADD UNIQUE KEY `slug_30` (`slug`),
  ADD UNIQUE KEY `slug_31` (`slug`),
  ADD UNIQUE KEY `slug_32` (`slug`),
  ADD UNIQUE KEY `slug_33` (`slug`),
  ADD UNIQUE KEY `slug_34` (`slug`),
  ADD UNIQUE KEY `slug_35` (`slug`),
  ADD UNIQUE KEY `slug_36` (`slug`),
  ADD UNIQUE KEY `slug_37` (`slug`),
  ADD UNIQUE KEY `slug_38` (`slug`),
  ADD UNIQUE KEY `slug_39` (`slug`),
  ADD UNIQUE KEY `slug_40` (`slug`),
  ADD UNIQUE KEY `slug_41` (`slug`),
  ADD UNIQUE KEY `slug_42` (`slug`),
  ADD UNIQUE KEY `slug_43` (`slug`),
  ADD UNIQUE KEY `slug_44` (`slug`),
  ADD UNIQUE KEY `slug_45` (`slug`),
  ADD UNIQUE KEY `slug_46` (`slug`),
  ADD UNIQUE KEY `slug_47` (`slug`),
  ADD UNIQUE KEY `slug_48` (`slug`),
  ADD UNIQUE KEY `slug_49` (`slug`),
  ADD UNIQUE KEY `slug_50` (`slug`),
  ADD UNIQUE KEY `slug_51` (`slug`),
  ADD UNIQUE KEY `slug_52` (`slug`),
  ADD UNIQUE KEY `slug_53` (`slug`),
  ADD UNIQUE KEY `slug_54` (`slug`),
  ADD UNIQUE KEY `slug_55` (`slug`);

--
-- Indexes for table `brokers`
--
ALTER TABLE `brokers`
  ADD PRIMARY KEY (`broker_id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `contact_details`
--
ALTER TABLE `contact_details`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `contact_inquiries`
--
ALTER TABLE `contact_inquiries`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `delivery_charge`
--
ALTER TABLE `delivery_charge`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `footer_settings`
--
ALTER TABLE `footer_settings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `global_prices`
--
ALTER TABLE `global_prices`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `navbar`
--
ALTER TABLE `navbar`
  ADD PRIMARY KEY (`nav_id`);

--
-- Indexes for table `oil_cake_price`
--
ALTER TABLE `oil_cake_price`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `oil_cake_requests`
--
ALTER TABLE `oil_cake_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_oilcake_user` (`user_id`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`order_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`order_item_id`),
  ADD KEY `order_id` (`order_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`product_id`);

--
-- Indexes for table `register`
--
ALTER TABLE `register`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `emali` (`emali`),
  ADD UNIQUE KEY `emali_2` (`emali`),
  ADD UNIQUE KEY `emali_3` (`emali`),
  ADD UNIQUE KEY `emali_4` (`emali`),
  ADD UNIQUE KEY `emali_5` (`emali`),
  ADD UNIQUE KEY `emali_6` (`emali`),
  ADD UNIQUE KEY `emali_7` (`emali`),
  ADD UNIQUE KEY `emali_8` (`emali`),
  ADD UNIQUE KEY `emali_9` (`emali`),
  ADD UNIQUE KEY `emali_10` (`emali`),
  ADD UNIQUE KEY `emali_11` (`emali`),
  ADD UNIQUE KEY `emali_12` (`emali`),
  ADD UNIQUE KEY `emali_13` (`emali`),
  ADD UNIQUE KEY `emali_14` (`emali`),
  ADD UNIQUE KEY `emali_15` (`emali`),
  ADD UNIQUE KEY `emali_16` (`emali`),
  ADD UNIQUE KEY `emali_17` (`emali`),
  ADD UNIQUE KEY `emali_18` (`emali`),
  ADD UNIQUE KEY `emali_19` (`emali`),
  ADD UNIQUE KEY `emali_20` (`emali`),
  ADD UNIQUE KEY `emali_21` (`emali`),
  ADD UNIQUE KEY `emali_22` (`emali`),
  ADD UNIQUE KEY `emali_23` (`emali`),
  ADD UNIQUE KEY `emali_24` (`emali`),
  ADD UNIQUE KEY `emali_25` (`emali`),
  ADD UNIQUE KEY `emali_26` (`emali`),
  ADD UNIQUE KEY `emali_27` (`emali`),
  ADD UNIQUE KEY `emali_28` (`emali`),
  ADD UNIQUE KEY `emali_29` (`emali`),
  ADD UNIQUE KEY `emali_30` (`emali`),
  ADD UNIQUE KEY `emali_31` (`emali`),
  ADD UNIQUE KEY `emali_32` (`emali`),
  ADD UNIQUE KEY `emali_33` (`emali`),
  ADD UNIQUE KEY `emali_34` (`emali`),
  ADD UNIQUE KEY `emali_35` (`emali`),
  ADD UNIQUE KEY `emali_36` (`emali`),
  ADD UNIQUE KEY `emali_37` (`emali`),
  ADD UNIQUE KEY `emali_38` (`emali`),
  ADD UNIQUE KEY `emali_39` (`emali`),
  ADD UNIQUE KEY `emali_40` (`emali`),
  ADD UNIQUE KEY `emali_41` (`emali`),
  ADD UNIQUE KEY `emali_42` (`emali`),
  ADD UNIQUE KEY `emali_43` (`emali`),
  ADD UNIQUE KEY `emali_44` (`emali`),
  ADD UNIQUE KEY `emali_45` (`emali`),
  ADD UNIQUE KEY `emali_46` (`emali`),
  ADD UNIQUE KEY `emali_47` (`emali`),
  ADD UNIQUE KEY `emali_48` (`emali`),
  ADD UNIQUE KEY `emali_49` (`emali`),
  ADD UNIQUE KEY `emali_50` (`emali`),
  ADD UNIQUE KEY `emali_51` (`emali`),
  ADD UNIQUE KEY `emali_52` (`emali`),
  ADD UNIQUE KEY `emali_53` (`emali`),
  ADD UNIQUE KEY `emali_54` (`emali`),
  ADD UNIQUE KEY `emali_55` (`emali`),
  ADD UNIQUE KEY `emali_56` (`emali`),
  ADD UNIQUE KEY `emali_57` (`emali`),
  ADD UNIQUE KEY `emali_58` (`emali`),
  ADD UNIQUE KEY `emali_59` (`emali`),
  ADD UNIQUE KEY `emali_60` (`emali`),
  ADD UNIQUE KEY `emali_61` (`emali`),
  ADD UNIQUE KEY `emali_62` (`emali`),
  ADD UNIQUE KEY `emali_63` (`emali`);

--
-- Indexes for table `selling_requests`
--
ALTER TABLE `selling_requests`
  ADD PRIMARY KEY (`request_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `fk_selling_requests_broker_id_register` (`broker_id`);

--
-- Indexes for table `shop_details`
--
ALTER TABLE `shop_details`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `site_config`
--
ALTER TABLE `site_config`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `about_us`
--
ALTER TABLE `about_us`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `about_us_members`
--
ALTER TABLE `about_us_members`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `blog_details`
--
ALTER TABLE `blog_details`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `brokers`
--
ALTER TABLE `brokers`
  MODIFY `broker_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `contact_details`
--
ALTER TABLE `contact_details`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `contact_inquiries`
--
ALTER TABLE `contact_inquiries`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `delivery_charge`
--
ALTER TABLE `delivery_charge`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `footer_settings`
--
ALTER TABLE `footer_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `global_prices`
--
ALTER TABLE `global_prices`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `navbar`
--
ALTER TABLE `navbar`
  MODIFY `nav_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `oil_cake_price`
--
ALTER TABLE `oil_cake_price`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `oil_cake_requests`
--
ALTER TABLE `oil_cake_requests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `order_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `order_item_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `product_id` int(10) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `register`
--
ALTER TABLE `register`
  MODIFY `user_id` int(50) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- AUTO_INCREMENT for table `selling_requests`
--
ALTER TABLE `selling_requests`
  MODIFY `request_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `shop_details`
--
ALTER TABLE `shop_details`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `site_config`
--
ALTER TABLE `site_config`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `contact_inquiries`
--
ALTER TABLE `contact_inquiries`
  ADD CONSTRAINT `contact_inquiries_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `register` (`user_id`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `register` (`user_id`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Constraints for table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_ibfk_19` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `order_items_ibfk_20` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Constraints for table `selling_requests`
--
ALTER TABLE `selling_requests`
  ADD CONSTRAINT `fk_selling_requests_broker_id_register` FOREIGN KEY (`broker_id`) REFERENCES `register` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `selling_requests_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `register` (`user_id`) ON DELETE NO ACTION ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
