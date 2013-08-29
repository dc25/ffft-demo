/// <reference path="angularjs/angular.d.ts" />

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
        var res = "" + Math.round(r * this.re) / r;
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
        res += (Math.round(r * imPart) / r + "i");
        return res;
    }
}

class Transform {

    constructor(public primaryValue: string, public secondaryValue: string) {
        this.computeTransform();
    }

    public coefficients: Complex[][];

    computeCoefficient(row: number, column: number, bitCount: number): Complex {
        var t = column >>> row;
        var s = column - (t << row);
        var bitMask = (1 << (row - 1)) - 1; // to mask all but the high bit of s.
        var sHighBitRemoved = s & bitMask;
        var iRe = (t << (row - 1)) + sHighBitRemoved;
        var iIm = iRe + (1 << (bitCount - 1));
        var rotation = Complex.powerOfE(2 * Math.PI * column / (1 << row));
        return Complex.add(this.coefficients[row - 1][iRe], Complex.mul(rotation, this.coefficients[row - 1][iIm]));
    }

    computeCoefficients(firstRow: Complex[], rowCount: number): void {

        var bitCount = rowCount - 1;
        var columnCount = firstRow.length;
        
        this.coefficients = [];
        this.coefficients.push(firstRow);
 
        for (var r = 1; r < rowCount; r++) {
            var workingRow = [];
            for (var c = 0; c < columnCount; c++) {
                var coef = this.computeCoefficient(r, c, bitCount);
                workingRow.push(coef);
            }
            this.coefficients.push(workingRow);
        }
    }
    
    computeTransform() : void {
        var maxlen = Math.max(this.primaryValue.length, this.secondaryValue.length);

        var columnCount = 1;
        var bitCount = 0;
        while (columnCount < maxlen)
        {
            columnCount *= 2;
            bitCount += 1;
        }
        columnCount *= 2;
        bitCount += 1;
        var rowCount = bitCount + 1;


        var workingRow = [];
        for (var c = 0; c < columnCount; c++) {
            var digit:number = (c < this.primaryValue.length) ? parseInt(this.primaryValue[this.primaryValue.length-c-1]) : 0;
            workingRow.push(new Complex(digit, 0));
        }

        this.computeCoefficients(workingRow, rowCount);
    }

    updatePrimary(newValue: string):void {
        this.primaryValue = newValue;
        this.computeTransform();
    }

    updateSecondary(newValue: string): void {
        this.secondaryValue = newValue;
        this.computeTransform();
    }

}

class multiplier {
    constructor($scope) {
        $scope.m0 = "2642";
        $scope.m1 = "5821";

        $scope.t0 = new Transform($scope.m0, $scope.m1);
        $scope.t1 = new Transform($scope.m1, $scope.m0);

        $scope.$watch("m0",
            function (newValue:string, oldValue:string):void {
                if (newValue != oldValue) {
                    $scope.t0.updatePrimary(newValue);
                    $scope.t1.updateSecondary(newValue);
                }
            });

        $scope.$watch("m1",
            function (newValue: string, oldValue: string): void {
                if (newValue != oldValue) {
                    $scope.t1.updatePrimary(newValue);
                    $scope.t0.updateSecondary(newValue);
                }
            });

    }
}
