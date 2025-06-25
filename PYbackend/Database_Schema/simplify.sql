create database simplify;

-- Table for User
CREATE TABLE User (
    username VARCHAR(50) PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(100),
    password VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    profile_picture VARCHAR(255)
);

-- Table for Post
CREATE TABLE Post (
    post_id INT AUTO_INCREMENT PRIMARY KEY,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    username VARCHAR(50) NOT NULL,
    FOREIGN KEY (username) REFERENCES User(username) ON DELETE CASCADE
);

-- Table for Likes (junction table for User-Post many-to-many relationship)
CREATE TABLE Likes (
    username VARCHAR(50),
    post_id INT,
    Like_Date DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (username, post_id),
    FOREIGN KEY (username) REFERENCES User(username) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES Post(post_id) ON DELETE CASCADE
);

-- Table for Summaries
CREATE TABLE Summaries (
    summary_id INT AUTO_INCREMENT PRIMARY KEY,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    username VARCHAR(50) NOT NULL,
    FOREIGN KEY (username) REFERENCES User(username) ON DELETE CASCADE
);

-- Table for Website
CREATE TABLE Website (
    websiteID INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    URL VARCHAR(255) NOT NULL UNIQUE
);

-- Table for BlogLinks
CREATE TABLE BlogLinks (
    BlogLinkID INT AUTO_INCREMENT PRIMARY KEY,
    URL VARCHAR(255) NOT NULL UNIQUE,
    websiteID INT NOT NULL,
    FOREIGN KEY (websiteID) REFERENCES Website(websiteID) ON DELETE CASCADE
);

-- Junction table for Summaries-BlogLinks (many-to-many relationship)
CREATE TABLE Summaries_BlogLinks (
    summary_id INT,
    BlogLinkID INT,
    PRIMARY KEY (summary_id, BlogLinkID),
    FOREIGN KEY (summary_id) REFERENCES Summaries(summary_id) ON DELETE CASCADE,
    FOREIGN KEY (BlogLinkID) REFERENCES BlogLinks(BlogLinkID) ON DELETE CASCADE
);