#include <stdio.h>

int add(int x, int y) {
    return x + y;
}

int multiply(int x, int y) {
    return x * y;
}

int main() {
    int a = 5;
    int b = 3;

    int sum = add(a, b);
    printf("Sum of %d and %d is %d\n", a, b, sum);

    int product = multiply(a, b);
    printf("Product of %d and %d is %d\n", a, b, product);

    return 0;
}
