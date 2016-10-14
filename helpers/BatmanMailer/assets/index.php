<?php 
	require 'PHPmailer/PHPMailerAutoload.php';

	$mail = new PHPMailer();
	$mail->CharSet = "UTF-8";
	$mail->isSMTP();
	$mail->SMTPDebug = 2; 
	$mail->Debugoutput = 'html'; 
	$mail->Host = 'smtp.gmail.com'; 
	$mail->Port = 587; 
	$mail->SMTPSecure = 'tls'; 
	$mail->SMTPAuth = true; 
	$mail->Username = "listerine1989@gmail.com"; 
	$mail->Password = "gabi1989*"; 
	$mail->isHTML(true);  

	$json = $argv[1];
	$param = json_decode($json);

	var_dump($param);

	foreach ($param as $value) {
		$mail->Body = ($value->html);
		$mail->setFrom(($value->from), 'Shoply'); 
		$mail->addAddress(($value->to)); 
		$mail->Subject = ($value->subject); 
		$mail->send(); 
		$mail->ClearAddresses(); 
	}

?>