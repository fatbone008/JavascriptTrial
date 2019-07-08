/**
 * 判断是否是质数，一个质数是只能被自己和1除尽，所以可以通过一个循环，将被判断值不断的除以【1，n】内的所有数字，都不存在能除尽的，那么这个数n就是质数。
 * @param n - 被判断值
 * @returns {boolean}
 */
function isPrime(n) {
    var division = 2;

    while (n > division) {
        if (n % division == 0) {
            return false;
        } else {
            division++;
        }
    }

    return true;
}

/**
 * 扩展：改进一下？
 * 方法：自增的时候，其实可以直接增加2，因为偶数肯定不是质数，这样可以算快一点。
 */
// console.log(isPrime(137));
// console.log(isPrime(237));

/**
 * 找出一个数的所有质数因子，例如：69 => 3, 23  99 => 3, 3, 11
 * @param n
 */
function primeFactors(n) {
    var factor = [], divisor = 2;

    while (n > 2) {
        if (n % divisor === 0) {
            factor.push(divisor);
            n = n / divisor
        } else {
            divisor++
        }
    }

    return factor;
}

/**
 * 时间复杂度？
 * O(n)
 */

// console.log(primeFactors(99));
/**
 * 斐波那契数列，获取第n阶值
 * @param n
 * @returns {number}
 */
// 方法1
function fabonacci(n) {
    var fibo = [0, 1];

    if (n <= 2) return 1;
    for (var i = 2; i <= n; i++) {
        fibo[i] = fibo[i - 2] + fibo[i - 1];
    }

    return fibo[n];
}

// 时间复杂度：O(n)
// console.log(fabonacci(12))

//方法2
function fabonacci(n) {
    if (n <= 1) {
        return n;
    } else {
        return fabonacci(n - 2) + fabonacci(n - 1)
    }
}
// 时间复杂度，O(2^n)
console.log(fabonacci(12))