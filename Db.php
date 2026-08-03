<?php
// Fill these in with the details your hosting provider gives you.
// You'll get these from your host's control panel (cPanel, hPanel, etc.)
// when you create the MySQL database.

$DB_HOST = "localhost";        // usually "localhost"
$DB_NAME = "portfolio_db";     // the database name you created
$DB_USER = "your_db_username"; // your database username
$DB_PASS = "your_db_password"; // your database password

try {
    $pdo = new PDO(
        "mysql:host=$DB_HOST;dbname=$DB_NAME;charset=utf8mb4",
        $DB_USER,
        $DB_PASS,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
} catch (PDOException $e) {
    http_response_code(500);
    die("Database connection failed.");
}
