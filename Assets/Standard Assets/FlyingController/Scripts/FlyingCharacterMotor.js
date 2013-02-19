#pragma strict

var inputMoveDirection : Vector3 = Vector3.zero;
var currentSpeed : float = 0.0;
var flyingObject : Transform;
var forwardMovement : Vector3;

private var isActive : boolean = false;
private var isControllable : boolean = true;
var backwardsFallSpeed : float;
private var gotSpeed : boolean = false;



class multipliers{
	var turnMultiplier : float = 0.1;
	var bankTurnMultiplier : float = 0.1;
	var accelMultiplier : float = 0.1;
	var bankSpeedMultiplier : float = 0.1;
	var speedMultiplierM : float = 0.1;
	var fallMultiplier : float = 0.01;
	var angleFallMultiplier : float = 0.1;
	var tiltMultiplier : float = 0.1;
	var gravityMultiplier : float = 0.1;
}

class falling{
	var gravity : float = 10;
	var gravityAccel : float = 10;
	var terminalVelocity : float = 400; 
	var backwardsFall : float = 20;
	var backwardsDecel : float = 3;
}

class flyingController{
	var bankLimit : float = 60.0;
	var tiltSpeed : float = 0.5;
	var bankSpeed : float = 0.5;
	var turnSpeed : float = 0.5;
	var accelaration : float = 1.0;
	var drag : float = 0.5;
	var breakSpeed : float = 10;
	var breakTurning : float = 5;
	var speedApex : float = 20;
	var turningSpeedLoss : float = 0.5;
	var skid : float = 10;
	var accelForce : float = 10;
	
	var falling : falling;
	var multipliers : multipliers;
}

var controller : flyingController = flyingController();

var speedMultiplier : float;

var mouseLook : MouseLookFlying;

function Awake(){
	if(flyingObject != null){
		forwardMovement = flyingObject.TransformDirection(Vector3.forward);
	}
	mouseLook = GetComponentInChildren(MouseLookFlying);
}

function UpdateFunction(){
	setSkid();
	setCurrentSpeed();
	applyGravity();
	transform.position += forwardMovement*currentSpeed*Time.deltaTime;
	fallBackwards();
	setSpeedMultiplier();
	turnFlyer();
}

function Update () {
	if(Input.GetAxis("Vertical")>0 && isActive == false){
		isActive = true;
	}
	if(isActive==true && isControllable){
		UpdateFunction();
	}
	if(isControllable == false){
		
	}
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

function vectorDistanceAbs(vector1 : Vector3, vector2 : Vector3){
	var x : float = angleDistance(vector1.x, vector2.x);
	var y : float = angleDistance(vector1.y, vector2.y);
	var z : float = angleDistance(vector1.z, vector2.z);
	
	return Vector3(Mathf.Abs(x),Mathf.Abs(y),Mathf.Abs(z));

}

function vectorAbs(vector : Vector3){
	var x : float = Mathf.Abs(vector.x);
	var y : float = Mathf.Abs(vector.y);
	var z : float = Mathf.Abs(vector.z);
	
	return x + y + z;
}

function getForwardVelocity(){
	var forwardVelocity : float;
	var velocity : Vector3 = (forwardMovement*currentSpeed);
	var flyingObjectDirection : Vector3 = flyingObject.TransformDirection(flyingObject.forward);
	var objectDirectionDistance = vectorDistanceAbs(forwardMovement,flyingObjectDirection);
	var speedLoss : float = vectorAbs(objectDirectionDistance)*controller.turningSpeedLoss/100;

	forwardVelocity = currentSpeed - (currentSpeed*speedLoss*Time.deltaTime);
	forwardVelocity += getAngleMultiplier();
	return forwardVelocity;
}

function setCurrentSpeed(){
	currentSpeed = getForwardVelocity();
	if(Input.GetAxis("Vertical") > 0){
		currentSpeed += Input.GetAxis("Vertical")*controller.accelaration*Time.deltaTime;
	}
	if(Input.GetAxis("Vertical") < 0 && currentSpeed >= 0){
		currentSpeed += Input.GetAxis("Vertical")*controller.breakSpeed*Time.deltaTime;
	}
	if(currentSpeed > controller.drag*Time.deltaTime){
		currentSpeed -= controller.drag*Time.deltaTime;
	}
	if(currentSpeed < controller.drag*Time.deltaTime){
		currentSpeed = 0;
	}
}

function getSkid(){
	if(Input.GetAxis("Vertical")>0){
		return controller.skid*controller.accelForce;
	}
	else{
		return controller.skid;
	}
}

function setSkid(){
	var flyerFront : Vector3 = flyingObject.TransformDirection(Vector3.forward);
	if(forwardMovement != flyerFront){
		forwardMovement = Vector3.Lerp(forwardMovement, flyerFront, Time.deltaTime*getSkid()/currentSpeed);
	}
}

function setSpeedMultiplier(){

	var x : float = controller.multipliers.turnMultiplier*controller.speedApex;
	if(currentSpeed<controller.speedApex){
		speedMultiplier = 0.1 + ( controller.multipliers.turnMultiplier*currentSpeed);
	}
	if(currentSpeed>=controller.speedApex){
		speedMultiplier = 0.1 + ( x - (x-(x/(1+((currentSpeed-controller.speedApex)/controller.multipliers.speedMultiplierM)))));
	}
}

function turnFlyer(){
	var camera = transform.Find("Camera Pivot");
	var cameraRotation : Vector3 = camera.eulerAngles;
	var flyerRotation : Vector3 = flyingObject.eulerAngles;
	if(Input.GetAxis("Vertical")<0){
		speedMultiplier*=controller.breakTurning;
	}
	
	var bankMultiplier : float = flyerRotation.z * controller.multipliers.bankTurnMultiplier;
	if (flyerRotation.z <360 && flyerRotation.z > 360 - controller.bankLimit){
		bankMultiplier = (360 - flyerRotation.z)*controller.multipliers.bankTurnMultiplier;
	}	
	if(cameraRotation.x != flyerRotation.x){
		if(currentSpeed > 0){
			flyingObject.eulerAngles.x = Mathf.LerpAngle(flyerRotation.x, cameraRotation.x, Time.deltaTime*controller.tiltSpeed*speedMultiplier*controller.multipliers.tiltMultiplier);
		}
		if (currentSpeed == 0){
			flyingObject.eulerAngles.x = Mathf.LerpAngle(flyerRotation.x, cameraRotation.x, Time.deltaTime*controller.tiltSpeed*controller.multipliers.tiltMultiplier);
		}
	}
	if(angleDistance(flyerRotation.y, cameraRotation.y) > 0){
		if(currentSpeed > 0){
			flyingObject.eulerAngles.z = Mathf.LerpAngle(flyerRotation.z, Mathf.Clamp(360 - angleDistance(flyerRotation.y, cameraRotation.y),360 - controller.bankLimit,360), Time.deltaTime*controller.bankSpeed*
			controller.multipliers.bankSpeedMultiplier);
		}
		if(flyerRotation.z < 360 && flyerRotation.z > 360-controller.bankLimit){
			flyingObject.eulerAngles.y = Mathf.LerpAngle(flyerRotation.y,cameraRotation.y,Time.deltaTime*controller.turnSpeed*speedMultiplier*bankMultiplier);		
		}
	}
	if(angleDistance(flyerRotation.y, cameraRotation.y) < 0){
		if(currentSpeed > 0){
			flyingObject.eulerAngles.z = Mathf.LerpAngle(flyerRotation.z, Mathf.Clamp(Mathf.Abs(angleDistance(flyerRotation.y, cameraRotation.y)),0,controller.bankLimit), Time.deltaTime*controller.bankSpeed*
			controller.multipliers.bankSpeedMultiplier);
		}
		if(flyerRotation.z > 0 && flyerRotation.z < controller.bankLimit){
			flyingObject.eulerAngles.y = Mathf.LerpAngle(flyerRotation.y,cameraRotation.y,Time.deltaTime*controller.turnSpeed*speedMultiplier*bankMultiplier);		
		}
	}
}

function getAngleMultiplier(){
	var angleMultiplier : float = 0;
	if(Mathf.Abs(angleDistance(flyingObject.eulerAngles.x,90))<90){
		angleMultiplier = (91-Mathf.Abs(angleDistance(flyingObject.eulerAngles.x,90)))*controller.multipliers.angleFallMultiplier;
	}
	if(Mathf.Abs(angleDistance(flyingObject.eulerAngles.x,270))<90){
		angleMultiplier = -(91-Mathf.Abs(angleDistance(flyingObject.eulerAngles.x,270)))*controller.multipliers.angleFallMultiplier;
	}
	return angleMultiplier*angleMultiplier;
}

function applyGravity(){
	var gravity : float = controller.falling.gravity;
	gravity = (gravity/(currentSpeed+1))*controller.multipliers.gravityMultiplier;
	mouseLook.gravity = gravity;
}

function fallBackwards(){
	if(currentSpeed == 0 && flyingObject.eulerAngles.x > 270 && flyingObject.eulerAngles.x <360&&gotSpeed == false){
		backwardsFallSpeed = (360-flyingObject.eulerAngles.x)*controller.falling.backwardsFall;
		gotSpeed = true;
	}
	if(backwardsFallSpeed > 0){
		backwardsFallSpeed -= controller.falling.backwardsDecel*Time.deltaTime;
	}
	if(backwardsFallSpeed > 0){
		transform.position += flyingObject.TransformDirection(Vector3.back)*backwardsFallSpeed*Time.deltaTime;
	}
	if(backwardsFallSpeed <= 0 && gotSpeed == true){
		gotSpeed = false;
		backwardsFallSpeed = 0;
		currentSpeed = 0;
	}
}