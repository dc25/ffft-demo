/// <reference path="angularjs/angular.d.ts" />


function formattedNumber(n:number):string {
    var r = 100;
    return "" + Math.round(r * n) / r;
}

class Complex {
    constructor(public re: number, public im: number) {}

    static add(c0:Complex, c1:Complex) : Complex {
        var res = new Complex(c0.re + c1.re, c0.im + c1.im);
        return res;
    }
    
    static mul(c0: Complex, c1: Complex) : Complex {
        var res = new Complex(c0.re*c1.re - c0.im * c1.im, c0.re*c1.im + c0.im*c1.re);
        return res;
    }

    static powerOfE(exponent: number): Complex {
        return new Complex(Math.cos(exponent), Math.sin(exponent));
    }

    public toString() {
        var r = 100;
        var res = formattedNumber(this.re);
        if (this.im == 0.0) {
            return res;
        }
        var imPart = this.im;
        if (imPart > 0.0) {
            res += "+";
        } else {
            res += "-";
            imPart = -imPart;
        }
        res += (formattedNumber(imPart) + "i");
        return res;
    }
}


// A Transform is an array of complex numbers. 
// Each row of complex numbers in the Transform is a step in the process of transforming the coefficients
// of a polynomial to the Finite Fourier Transform of that polynomial ( or vice-versa ).
class Transform {

    public coefficients: Complex[][];

    computeCoefficient(row: number, column: number, columnCount: number, forward: boolean): Complex {
        var t = column >>> row;
        var s = column - (t << row);
        var bitMask = (1 << (row - 1)) - 1; // to mask all but the high bit of s.
        var sHighBitRemoved = s & bitMask;
        var iRe = (t << (row - 1)) + sHighBitRemoved;
        var iIm = iRe + columnCount / 2;
        var exp = 2 * Math.PI * column / (1 << row);
        if (!forward) {
            exp *= -1;
        }
        var rotation = Complex.powerOfE(exp);
        return Complex.add(this.coefficients[row - 1][iRe], Complex.mul(rotation, this.coefficients[row - 1][iIm]));
    }

    constructor(firstRow: Complex[], forward?:boolean) {

        if (forward === undefined) {
            forward = true;
        }

        var columnCount = firstRow.length;
        var rowCount = 0;
        for (var cc = columnCount; cc > 0; cc >>>= 1) {
            rowCount++;
        }

        this.coefficients = [];
        this.coefficients.push(firstRow);
 
        for (var r = 1; r < rowCount; r++) {
            var workingRow = [];
            for (var c = 0; c < columnCount; c++) {
                var coef = this.computeCoefficient(r, c, columnCount, forward);
                workingRow.push(coef);
            }
            this.coefficients.push(workingRow);
        }
    }

    lastRow(): Complex[]{
        return this.coefficients[this.coefficients.length - 1];
    }

    scaledLastRow(): number[] {
        var lr = this.lastRow();
        var res:number[] = [];
        for (var i = 0; i < lr.length; i++) {
            res.push(lr[i].re/lr.length);
        }
        return res;
    }

    digitsLastRow(): number[]{
        var slr = this.scaledLastRow();
        var res: number[] = [];
        var carry0 = 0;
        for (var i = 0; i < slr.length; i++)
        {
            var totalDigit = slr[i] + carry0+.001; // .001 to assure tiny negative numbers don't get floored to -1
            var carry1 = Math.floor((totalDigit) / 10);
            res.push(Math.round(totalDigit - carry1 * 10));
            carry0 = carry1;
        }
        return res;
    }
}

class multiplier {

    // The lowest power of two greater than the number of digits in both values.
    columnCount(primaryValue: string, secondaryValue: string): number {
        var maxlen = Math.max(primaryValue.length, secondaryValue.length);

        var columnCount = 1;
        for (maxlen--; maxlen; maxlen >>>= 1) {
            columnCount <<= 1;
        }
        columnCount <<= 1;
        return columnCount;

    }

    // Generate arrays of strings useful for decorating the web page that 
    // illustrates using fast finite fourier transforms to multiply numbers together.
    makeLabels($scope: any, columnCount: number): void {

        if ($scope.columnLabels !== undefined && columnCount == $scope.columnLabels.length) {
            return;
        }

        if (columnCount == 0) {
            $scope.columnLabels = [];
            return;
        }

        // create pad string of zeros.
        var bitCount = 0;
        var pad = "";
        for (var pc = columnCount-1; pc; pc >>= 1) {
            bitCount += 1;
            pad = pad.concat("0");
        }
        var res: string[] = [];
        for (var i = 0; i < columnCount; i++) {
            var unpadded = i.toString(2);
            var label = (pad + unpadded).substr(unpadded.length, bitCount);
            res.push(label);
        }
        $scope.columnLabels = res;

        var stars: string = "**********************************************"; 
        var subscripts: string[] = [];
        for (var i = 0; i < bitCount + 1; i++) {
            var start: string = i ? stars.slice(-i) : "-";
            var finish: string = bitCount - i ? stars.slice(-(bitCount - i)) : "-";
            subscripts.push(start + "|" + finish);
        }
        $scope.rowSubscripts = subscripts;
        $scope.rowReverseSubscripts = [];
        for (var i = 0; i < subscripts.length; i++)
        {
            $scope.rowReverseSubscripts.push(subscripts[subscripts.length - i - 1]);
        }
    }

    // Convert an integer represented as a string into an array of complex coefficients.
    // The real part of each coefficient holds one digit of the number.  The imaginary part is zero.
    stringToCoefficients(primaryValue: string, columnCount: number): Complex[] {
        var res: Complex[] = [];
        for (var c = 0; c < columnCount; c++) {
            var digit: number = (c < primaryValue.length) ? parseInt(primaryValue[primaryValue.length - c - 1]) : 0;
            res.push(new Complex(digit, 0));
        }

        return res;

    }

    // Term by term multiplication of two arrays of complex numbers.
    convolute(r0: Complex[], r1: Complex[]): Complex[] {
        var res:Complex[] = [];
        for (var i = 0; i < r1.length; i++) {
            res[i] = Complex.mul(r0[i], r1[i]);
        }
        return res;
    }


    // Convert a number represented as coefficients of powers of 10 to another such "number".
    // The input may have coefficients greater than 10 but the output will not.  The result 
    // can be regarded as an array of digits.
    convertToSingleDigits(multipleDigits: number[]): number[] {
        var res: number[] = [];
        var carry0 = 0;
        for (var i = 0; i < multipleDigits.length; i++)
        {
            var totalDigit = multipleDigits[i] + carry0 + .001; // .001 to assure tiny negative numbers don't get floored to -1
            var carry1 = Math.floor((totalDigit) / 10);
            res.push(Math.round(totalDigit - carry1 * 10));
            carry0 = carry1;
        }
        return res;
    }

    // Given a number represented as an array of digits generate a string representation.
    digitsToString(p: number[]): string {
        // find the highest order non-zero digit.
        var i;
        for (i = p.length - 1; i > 0; i--) {
            if (p[i]) {
                break;
            }
        }

        var res: string = "";
        for (; i >= 0; i--) {
            res = res.concat(p[i]);  // inefficient but probably not significantly.
        }
        return res;
    }

    compute($scope: any): void {
        var cc = this.columnCount($scope.m0, $scope.m1);
        this.makeLabels($scope, cc);
        $scope.t0 = new Transform(this.stringToCoefficients($scope.m0, cc));
        $scope.t1 = new Transform(this.stringToCoefficients($scope.m1, cc));
        $scope.product = new Transform(this.convolute($scope.t0.lastRow(), $scope.t1.lastRow()), false);
        $scope.scaled = $scope.product.scaledLastRow();
        $scope.result = this.convertToSingleDigits($scope.scaled);
        $scope.finalResult = this.digitsToString($scope.result);
    }


    constructor($scope) {
        $scope.m0 = "2642";
        $scope.m1 = "5821";
        $scope.columnLabels = [];

        this.compute($scope);

        $scope.$watch("m0",
            (newValue:string, oldValue:string):void => {
                if (newValue != oldValue) {
                    this.compute($scope);
                }
            });

        $scope.$watch("m1",
            (newValue: string, oldValue: string): void => {
                if (newValue != oldValue) {
                    this.compute($scope);
                }
            });
    }
}
