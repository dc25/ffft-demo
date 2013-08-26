/// <reference path="angularjs/angular.d.ts" />

function padLeft(nr:string, n:number, str?:string) {
    var padding = Array(n - nr.length + 1).join(str || '0');
    return padding+nr;
}

class multiplier {
    constructor($scope) {
        $scope.m0 = "";
        $scope.m1 = "";

        $scope.digitize0 = (m0: string, m1: string): string[] => {
            var maxlen = Math.max(m0.length, m1.length);
            if (maxlen == 0) {
                return ['0'];
            }

            var plen = 1;
            while (plen < maxlen)
            {
                plen *= 2;
            }
            plen *= 2;

            var padded = padLeft(m0, plen);
            return padded.split('');
        }
    }
}
