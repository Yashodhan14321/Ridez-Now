function validateregister(){
	var password = document.getElementById('password').value;
	var cpassword = document.getElementById('cpassword').value;
	if(password.equals(cpassword)){

	}
	else{
		alert("password didn't match");
		return false;
	}
	var phone = document.getElementById('phone');
	if(phone.length()!=10){
		alert("Invalid PhoneNumber");
		return false;
	}
	return true;
}