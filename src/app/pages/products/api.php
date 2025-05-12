<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");



// Get POST data
$_POST = json_decode(file_get_contents("php://input"), true) ?? $_POST;

class Database
{
    private $host = "localhost";
    private $database = "rateit";
    private $username = "root";
    private $password = "";

    public function getConnection()
    {
        $conn = new mysqli($this->host, $this->username, $this->password, $this->database);

        if ($conn->connect_error) {
            die("Connection failed: " . $conn->connect_error);
        }

        return $conn;
    }
}


$db = new Database();
$conn = $db->getConnection();


$action = isset($_GET['action']) ? $_GET['action'] : '';

switch ($action) {
    case 'createUser':
        if (isset($_POST['username']) && isset($_POST['pass'])) {
            $username = $conn->real_escape_string($_POST['username']);
            $pass = $_POST['pass'];

            $query = "INSERT INTO users (username, pass, is_master) VALUES ('$username', '$pass', 0)";
            if ($conn->query($query)) {
                echo json_encode(["message" => "User created"]);
            } else {
                echo json_encode(["error" => "Failed to create user: " . $conn->error]);
            }
        } else {
            echo json_encode(["error" => "Missing username or password"]);
        }
        break;

    case 'getUsers':
        $result = $conn->query("SELECT id, username, created_at, is_master FROM users");
        $users = [];
        while ($row = $result->fetch_assoc()) {
            $users[] = $row;
        }
        echo json_encode($users);
        break;

    // Product operations
    case 'createProduct':
        if (isset($_POST['name']) && isset($_POST['category']) && isset($_POST['description'])) {
            $name = $conn->real_escape_string($_POST['name']);
            $category = $conn->real_escape_string($_POST['category']);
            $description = $conn->real_escape_string($_POST['description']);

            // Now check if any of the fields are empty after we've defined them
            if (empty($name) || empty($category) || empty($description)) {
                echo json_encode(['success' => false, 'message' => 'Wszystkie pola są wymagane']);
                exit;
            }

            $query = "INSERT INTO products (name, category, description) VALUES ('$name', '$category', '$description')";
            if ($conn->query($query)) {
                echo json_encode(["success" => true, "message" => "Product created"]);
            } else {
                echo json_encode(["success" => false, "error" => "Failed to create product: " . $conn->error]);
            }
        } else {
            echo json_encode(["success" => false, "error" => "Missing name, category, or description"]);
        }
        break;

    case 'getProducts':
        $result = $conn->query("SELECT * FROM products");
        $products = [];
        while ($row = $result->fetch_assoc()) {
            $products[] = $row;
        }
        echo json_encode($products);
        break;
    case 'deleteProduct':
        if (isset($_POST['id']) && ($_POST['is_master'] == 1)) {
            $id = $conn->real_escape_string($_POST['id']);

            if ($conn->query("DELETE FROM products WHERE id = $id")) {
                echo json_encode(["message" => "Product deleted"]);
            } else {
                echo json_encode(["error" => "Failed to delete product: " . $conn->error]);
            }

        } else {
            echo json_encode(["error" => "Missing id propably"]);
        }

        break;
    // Review operations
    case 'createReview':
        if (isset($_POST['user_id']) && isset($_POST['product_id']) && isset($_POST['rating'])) {
            if ($_POST['rating'] < 1 || $_POST['rating'] > 5) {
                echo json_encode(["error" => "Rating must be between 1 and 5"]);
                break;
            }

            $user_id = $conn->real_escape_string($_POST['user_id']);
            $product_id = $conn->real_escape_string($_POST['product_id']);
            $rating = $conn->real_escape_string($_POST['rating']);

            $query = "INSERT INTO reviews (user_id, product_id, rating) VALUES ('$user_id', '$product_id', '$rating')";
            if ($conn->query($query)) {
                // Update average rating
                $update_query = "UPDATE products SET avg_rating = (SELECT AVG(rating) FROM reviews WHERE product_id = '$product_id') WHERE id = '$product_id'";
                $conn->query($update_query);

                echo json_encode(["message" => "Review created"]);
            } else {
                echo json_encode(["error" => "Failed to create review: " . $conn->error]);
            }
        } else {
            echo json_encode(["error" => "Missing user_id, product_id, or rating"]);
        }
        break;

    case 'getReviews':
        $result = $conn->query("SELECT r.*, u.username, p.name as product_name FROM reviews r 
                            LEFT JOIN users u ON r.user_id = u.id 
                            LEFT JOIN products p ON r.product_id = p.id");
        $reviews = [];
        while ($row = $result->fetch_assoc()) {
            $reviews[] = $row;
        }
        echo json_encode($reviews);
        break;
    case 'login':
        if (isset($_POST['username']) && isset($_POST['pass'])) {
            $username = $conn->real_escape_string($_POST['username']);
            $pass = $_POST['pass'];

            // Make sure is_master is included in the query
            $query = "SELECT id, username, is_master FROM users WHERE username = '$username' AND pass = '$pass'";
            $result = $conn->query($query);

            if ($result->num_rows > 0) {
                $user = $result->fetch_assoc();
                echo json_encode([
                    "success" => true,
                    "user" => [
                        "id" => $user['id'],
                        "username" => $user['username'],
                        "is_master" => (int) $user['is_master'] // Include is_master property
                    ]
                ]);
            } else {
                echo json_encode(["error" => "Invalid username or password"]);
            }
        } else {
            echo json_encode(["error" => "Missing username or password"]);
        }
        break;
    default:
        echo json_encode(["error" => "Invalid action"]);
}

// Close connection
$conn->close();
?>