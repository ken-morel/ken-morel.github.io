int theta = 0;
void glMain()
{
    theta++;
    //the main c++ loop (i.e runs over and over)
    glClearColor(0.0f, 0.0f, 0.0f, 0.0f); //set clear color
            glClear(GL_COLOR_BUFFER_BIT);//clear screen

            glPushMatrix();//set matrix
            glRotatef(1, 0.0f, 0.0f, 1.0f);

            glBegin(GL_TRIANGLES);

                glColor3f(1.0f, 0.0f, 0.0f);   glVertex2f(0.0f,   1.0f);
                glColor3f(0.0f, 1.0f, 0.0f);   glVertex2f(0.87f,  -0.5f);
                glColor3f(0.0f, 0.0f, 1.0f);   glVertex2f(-0.87f, -0.5f);

            glEnd();

            glPopMatrix();

            SwapBuffers(hDC);

            theta += 1.0f;
            Sleep (1);
}
