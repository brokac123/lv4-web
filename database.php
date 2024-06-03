<?php
$servername = "localhost"; 
$username = "root"; 
$password = ""; 
$database = "web_lv4";

$con = mysqli_connect($servername,$username,$password,$database);

if (mysqli_connect_errno()) {
    echo "Failed to connect to MySQL: " . mysqli_connect_error();
    exit();
  }


  $sql = "SELECT name, price, stock FROM products";
  $result = $con->query($sql);
 
  $items = [];
  
  if ($result->num_rows > 0) {
      while($row = $result->fetch_assoc()) {
          $items[] = $row;
      }
  }
  
  echo json_encode($items);

  $con->close();
