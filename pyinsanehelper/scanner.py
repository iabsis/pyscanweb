try:
    import sane
except:
    print "Unable to import Pyinsame libs"

class Scanner:
    
    def getScannerList(self):
        scanOption = {}
        sane.init()
        scanners = sane.get_devices()
        for scanner in scanners:
            scan_open = sane.open(scanner[0])
            options = scan_open.get_options()
            scan_open.close()
            scanOption[scanner[0]] = {}
            for option in options:
                if option[1] == "mode":
                    scanOption[scanner[0]]["mode"] = option[8]
                elif option[1] == "source":
                    scanOption[scanner[0]]["source"] = option[8]
                elif option[1] == "resolution":
                    scanOption[scanner[0]]["resolution"] = {"min": option[8][0], "max": option[8][1], "step": option[8][2]}
        return scanOption
        
