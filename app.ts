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

    integersToCoefficients(primaryValue: string, secondaryValue: string): Complex[] {

        var maxlen = Math.max(primaryValue.length, secondaryValue.length);

        var columnCount = 1;
        for (maxlen--; maxlen; maxlen>>>=1) {
            columnCount<<=1;
        }
        columnCount <<= 1;

        var res:Complex[] = [];
        for (var c = 0; c < columnCount; c++) {
            var digit: number = (c < primaryValue.length) ? parseInt(primaryValue[primaryValue.length - c - 1]) : 0;
            res.push(new Complex(digit, 0));
        }

        return res;

    }

    convolute(r0: Complex[], r1: Complex[]): Complex[] {
        var res:Complex[] = [];
        for (var i = 0; i < r1.length; i++) {
            res[i] = Complex.mul(r0[i], r1[i]);
        }
        return res;
    }

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


    compute($scope: any):void {
        $scope.t0 = new Transform(this.integersToCoefficients($scope.m0, $scope.m1));
        $scope.t1 = new Transform(this.integersToCoefficients($scope.m1, $scope.m0));
        $scope.product = new Transform(this.convolute($scope.t0.lastRow(), $scope.t1.lastRow()), false);
        $scope.scaled = $scope.product.scaledLastRow();
        $scope.result = $scope.product.digitsLastRow();
        $scope.finalResult = this.digitsToString($scope.result);
    }


    constructor($scope) {
        $scope.m0 = "2642";
        $scope.m1 = "5821";

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
