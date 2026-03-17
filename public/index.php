<?php
/**
 * Bypass Hostinger Welcome Page
 * This file redirects all traffic to index.html
 */
$index_file = 'index.html';
if (file_exists($index_file)) {
    include($index_file);
} else {
    echo "App index.html not found. Please check deployment.";
}
exit;
?>
