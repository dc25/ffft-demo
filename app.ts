/// <reference path="angularjs/angular.d.ts" />

class Complex {
    constructor(public re: number, public im: number) {
    }

    static add(c0:Complex, c1:Complex) : Complex {
        var res = new Complex(c0.re + c1.re, c0.im + c1.im);
        return res;
    }

    
    static mul(c0: Complex, c1: Complex) : Complex {
        var res = new Complex(c0.re*c1.re - c0.im * c1.im, c0.re*c1.im + c0.im*c1.re);
        return res;
    }

}

class multiplier {
    constructor($scope) {
        $scope.m0 = "";
        $scope.m1 = "";

        $scope.transformations = [];

        $scope.transformationRows = (m0: string, m1: string): number[] => {
            var maxlen = Math.max(m0.length, m1.length);

            var plen = 1;
            var rowCount = 0;
            while (plen < maxlen)
            {
                plen *= 2;
                rowCount += 1;
            }
            plen *= 2;
            rowCount += 1;

            var res = [];
            for (var i = 0; i < rowCount; i++) {
                res.push(i);
            }
            return res;
        }

        $scope.transformationColumns = (m0: string, m1: string): number[]=> {
            var maxlen = Math.max(m0.length, m1.length);

            var columnCount = 1;
            var rowCount = 0;
            while (columnCount < maxlen)
            {
                columnCount *= 2;
                rowCount += 1;
            }
            columnCount *= 2;
            rowCount += 1;

            var res = [];
            for (var i = 0; i < columnCount; i++) {
                res.push(i);
            }
            return res;
        }

    }
}
