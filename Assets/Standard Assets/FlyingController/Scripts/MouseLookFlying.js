/// MouseLook rotates the transform based on the mouse delta.
/// Minimum and Maximum values can be used to constrain the possible rotation

/// To make an FPS style character:
/// - Create a capsule.
/// - Add the MouseLook script to the capsule.
///   -> Set the mouse look to use LookX. (You want to only turn character but not tilt it)
/// - Add FPSInputController script to the capsule
///   -> A CharacterMotor and a CharacterController component will be automatically added.

/// - Create a camera. Make the camera a child of the capsule. Reset it's transform.
/// - Add a MouseLook script to the camera.
///   -> Set the mouse look to use LookY. (You want the camera to tilt up and down like a head. The character already turns.)

enum RotationAxes{ MouseXAndY, MouseX, MouseY }
public var axes : RotationAxes = RotationAxes.MouseXAndY;
public var sensitivityX : float= 15F;
public var sensitivityY : float = 15F;

public var minimumX : float = -360F;
public var maximumX : float = 360F;

public var minimumY : float = -90F;
public var maximumY : float = 90F;

var rotationY : float = 0F;

public var gravity : float = 0;

function Update ()
{
	if (axes == RotationAxes.MouseXAndY)
	{
		var rotationX : float = (transform.localEulerAngles.y + Input.GetAxis("Mouse X") * sensitivityX);
		rotationY += (Input.GetAxis("Mouse Y") * sensitivityY) -gravity;
		rotationY = Mathf.Clamp (rotationY, minimumY, maximumY);
		
		transform.localEulerAngles = new Vector3(-rotationY, rotationX, 0);
	}
	else if (axes == RotationAxes.MouseX)
	{
		transform.Rotate(0, Input.GetAxis("Mouse X") * sensitivityX, 0);
	}
	else
	{
		rotationY += Input.GetAxis("Mouse Y") * sensitivityY;
		rotationY = Mathf.Clamp (rotationY, minimumY, maximumY);
		
		transform.localEulerAngles = Vector3(-rotationY, transform.localEulerAngles.y, 0);
	}

}

function Start ()
{
	// Make the rigid body not change rotation
	if (rigidbody)
		rigidbody.freezeRotation = true;
}