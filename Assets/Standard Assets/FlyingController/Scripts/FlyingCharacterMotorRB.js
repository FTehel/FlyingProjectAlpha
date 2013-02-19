#pragma strict

var accelaration : float = 1.0;
var flyingObject : Transform;
var bankSpeed : float = 10;
var pullUpSpeed : float = 10;
var turnSpeed : float = 10;

function FixedUpdate () {
	updateFunction();
}

function updateFunction(){
	if(Input.GetAxis("Vertical")>0){
		moveFlyer();
	}
	rotateFlyer();
}

function moveFlyer(){
	var flyingObjectDirection : Vector3 = flyingObject.TransformDirection(Vector3.forward);
	rigidbody.AddForce(flyingObjectDirection*accelaration, ForceMode.Acceleration);
}

function rotateFlyer(){
	var camera = transform.Find("Camera Pivot");
	var cameraRotation : Vector3 = camera.eulerAngles;
	var FORotation : Vector3 = flyingObject.eulerAngles;
	var xTorque : float = angleDistance(FORotation.x,cameraRotation.x)*pullUpSpeed;
	var zTorque : float = angleDistance(FORotation.y,cameraRotation.y)*bankSpeed;
	rigidbody.AddTorque(Vector3(xTorque,0,zTorque));

}

function angleDistance(angle1 : float, angle2 : float){
	var difference : float = angle2-angle1;
	if (difference <= -180){
		difference = (angle2+(360-angle1));
	}
	else if (difference > 180){
		difference = -(angle1+(360-angle2));
	}
	return difference;
}