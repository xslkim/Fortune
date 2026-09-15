using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class FreeCamera : MonoBehaviour
{
    // Start is called before the first frame update
    void Start()
    {
        
    }

    // Update is called once per frame
    void Update()
    {
        UpdateHeadPosByInput();
    }

    public float MoveSpeed = 2.0f; //regular speed
    public float RotateSpeed = 1f; //How sensitive it with mouse

    void UpdateHeadPosByInput()
    {
        float mouse_x = Input.GetAxis("Mouse X") * RotateSpeed;
        float mouse_y = Input.GetAxis("Mouse Y") * RotateSpeed;
        Vector3 mouseMove = new Vector3(transform.eulerAngles.x - mouse_y, transform.eulerAngles.y + mouse_x, 0);

        Quaternion q = Quaternion.Euler(mouseMove);
        transform.rotation = q;

        Vector3 p = GetBaseInput();
        p = p * MoveSpeed;

        p = p * Time.deltaTime;
        Vector3 curPos = transform.position;
        Vector3 newPos = p + curPos;
        transform.position = newPos;
    }

    private Vector3 GetBaseInput()
    {
        Vector3 p_Velocity = new Vector3();
        if (Input.GetKey(KeyCode.W))
        {
            p_Velocity += transform.forward.normalized;
        }
        if (Input.GetKey(KeyCode.S))
        {
            p_Velocity += -transform.forward.normalized;
        }
        if (Input.GetKey(KeyCode.A))
        {
            p_Velocity += -transform.right.normalized;
        }
        if (Input.GetKey(KeyCode.D))
        {
            p_Velocity += transform.right.normalized;
        }
        return p_Velocity;
    }
}
