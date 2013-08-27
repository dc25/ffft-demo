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

    public toString() {
        return "" + this.re + "+"  + this.im + "i";
    }
}

class Transform {

    constructor(public primaryValue: string, public secondaryValue: string) {
        this.compute();
    }

    public coefficients: Complex[][];

    compute() : void {
        var maxlen = Math.max(this.primaryValue.length, this.secondaryValue.length);

        var columnCount = 1;
        var rowCount = 0;
        while (columnCount < maxlen)
        {
            columnCount *= 2;
            rowCount += 1;
        }
        columnCount *= 2;
        rowCount += 1;

        this.coefficients = [];

        var workingRow = [];
        for (var c = 0; c < columnCount; c++) {
            var digit = (c < this.primaryValue.length) ? this.primaryValue[this.primaryValue.length-c-1] : 0;
            workingRow.push(new Complex(digit, 0));
        }
        this.coefficients.push(workingRow);

        for (var r = 1; r < rowCount; r++) {
            workingRow = [];
            for (var c = 0; c < columnCount; c++) {
                workingRow.push(new Complex(0, 0));
            }
            this.coefficients.push(workingRow);
        }
    }

    updatePrimary(newValue:string) {

    }
}

class multiplier {
    constructor($scope) {
        $scope.m0 = "4567";
        $scope.m1 = "3256";

        $scope.t0 = new Transform($scope.m0, $scope.m1);
        $scope.t1 = new Transform($scope.m1, $scope.m0);
        /*
        $scope.$watch("m0",
            function (newValue, oldValue) {
                if (newValue != oldValue) {
                    t0.updatePrimary(m0);
                    t1.updateSecondary(m0);
                }
            });
        */
    }
}
