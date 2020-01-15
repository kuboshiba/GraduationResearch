var code0 = '\
#include <stdio.h>\n\
\n\
int main() {\n\
    int array[10] = { 9, 8, 7, 6, 5, 4, 3, 2, 1, 0 };\n\
    int i, j, buf = 0;\n\
    \n\
    for (i=0; i<10; i++) printf("%2d", array[i]);\n\
    \n\
    for (i=0; i<10; i++) {\n\
        for (j=i+1; j<10; j++) {\n\
            if (array[i] > array[j]) {\n\
                buf = array[i];\n\
                array[i] = array[j];\n\
                array[j] = buf;\n\
            }\n\
        }\n\
    }\n\
    \n\
    printf("\\n");\n\
    for (i=0; i<10; i++) printf("%2d", array[i]);\n\
    \n\
    return 0;\n\
}';

var code1 = '\
#include <stdio.h>\n\
\n\
int main() {\n\
    int array[10] = { 9, 8, 7, 6, 5, 4, 3, 2, 1, 0 };\n\
    int i, j, buf = 0;\n\
    \n\
    for (i=0; i<10; i++) printf("%2d", array[i]);\n\
    \n\
    for (i=0; i<9; i++){\n\
        for (j=9; j>=i+1; j--){\n\
            if (array[j] < array[j-1]) {\n\
                buf = array[j];\n\
                array[j] = array[j-1];\n\
                array[j-1] = buf;\n\
            }\n\
        }\n\
    }\n\
    \n\
    printf("\\n");\n\
    for (i=0; i<10; i++) printf("%2d", array[i]);\n\
    \n\
    return 0;\n\
}\n\
';

var code2 = '\
#include <stdio.h>\n\
\n\
int main() {\n\
    int array[10] = { 9, 8, 7, 6, 5, 4, 3, 2, 1, 0 };\n\
    int i, j, min_index, buf = 0;\n\
    \n\
    for (i=0; i<10; i++) printf("%2d", array[i]);\n\
    \n\
    for (i=0; i<9; i++) {\n\
        min_index = i;\n\
        for (j=i+1; j<10; j++) {\n\
            if (array[j] < array[min_index]) {\n\
                min_index = j;\n\
            }\n\
        }\n\
        buf = array[min_index];\n\
        array[min_index] = array[i];\n\
        array[i] = buf;\n\
    }\n\
    \n\
    printf("\\n");\n\
    for (i=0; i<10; i++) printf("%2d", array[i]);\n\
    \n\
    return 0;\n\
}\n\
';

var code3 = '\
#include <stdio.h>\n\
\n\
int main() {\n\
    int array[10] = { 9, 8, 7, 6, 5, 4, 3, 2, 1, 0 };\n\
    int i, j, buf = 0;\n\
    \n\
    for (i=0; i<10; i++) printf("%2d", array[i]);\n\
    \n\
    for (i=1; i<10; i++) {\n\
        j = i;\n\
        while ((j > 0) && (array[j-1] > array[j])) {\n\
            buf = array[j-1];\n\
            array[j-1] = array[j];\n\
            array[j] = buf;\n\
            j--;\n\
        }\n\
    }\n\
    \n\
    printf("\\n");\n\
    for (i=0; i<10; i++) printf("%2d", array[i]);\n\
    \n\
    return 0;\n\
}\n\
';

function insertProgram(num) {
    switch(num) {
        case 0:
            console.log(code0);
            aceEditor.setValue(code0, 0);
            break;
        case 1:
            console.log(code1);
            aceEditor.setValue(code1, 0);
            break;
        case 2:
            console.log(code2);
            aceEditor.setValue(code2, 0);
            break;
        case 3:
            console.log(code3);
            aceEditor.setValue(code3, 0);
            break;
    }
}